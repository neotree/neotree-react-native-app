export type Backend = 'nodeapi' | 'webeditor' | 'local';

export type BackendKey = string;

export function backendKey(country: string | null | undefined, backend: Backend, hospital?: string | null): BackendKey {
    return hospital ? `${country || 'unknown'}:${backend}:${hospital}` : `${country || 'unknown'}:${backend}`;
}

// Consecutive network failures before a backend is considered down. Kept low so
// a genuine outage is detected quickly, but above 1 so a single transient blip
// doesn't trip it.
const FAILURE_THRESHOLD = 2;

// Base cooldown for the first time a circuit opens; doubles (capped) each time
// the half-open probe itself fails, so a persistent outage backs off instead
// of re-probing every 30s forever.
const BASE_COOLDOWN_MS = 30_000;
const MAX_COOLDOWN_MS = 5 * 60_000;
const JITTER_RATIO = 0.2; // +/-20%, so many devices don't all re-probe in lockstep

type CircuitPhase = 'closed' | 'open' | 'half-open';

interface CircuitState {
    phase: CircuitPhase;
    failures: number;
    openUntil: number; // epoch ms; meaningful only while phase === 'open'
    probeInFlight: boolean; // meaningful only while phase === 'half-open'
}

const CLOSED_STATE: CircuitState = { phase: 'closed', failures: 0, openUntil: 0, probeInFlight: false };

const circuits = new Map<BackendKey, CircuitState>();

function get(key: BackendKey): CircuitState {
    return circuits.get(key) || CLOSED_STATE;
}

function backoffCooldown(failures: number): number {
    const exponent = Math.max(0, failures - FAILURE_THRESHOLD);
    const raw = Math.min(BASE_COOLDOWN_MS * (2 ** exponent), MAX_COOLDOWN_MS);
    const jitter = raw * JITTER_RATIO * (Math.random() * 2 - 1);
    return Math.max(BASE_COOLDOWN_MS, Math.round(raw + jitter));
}

function openCircuit(key: BackendKey, failures: number): void {
    const openUntil = Date.now() + backoffCooldown(failures);
    circuits.set(key, { phase: 'open', failures, openUntil, probeInFlight: false });
    armCooldownTimer(key, openUntil);
}

/**
 * True when a caller should not even bother trying `key` right now: the
 * circuit is fully open, or it's half-open and another caller already claimed
 * the one probe attempt. A pure status read — safe to call as often as
 * needed (pool "should I keep pulling items" checks, UI status, etc.) since it
 * never itself changes state. It does NOT grant permission to actually make a
 * request during half-open; see `tryAcquireAttempt` for that.
 */
export function isBackendDown(key: BackendKey): boolean {
    const c = get(key);
    if (c.phase === 'open') return true;
    if (c.phase === 'half-open') return c.probeInFlight;
    return false;
}

/**
 * Claims permission to actually fire a request against `key` right now.
 * Unlike `isBackendDown`, this mutates state and must be called exactly once
 * per real attempt, immediately before making it. While closed, always
 * grants it. While open, always refuses. While half-open, grants it to
 * exactly one caller (first past the post — safe under concurrency because JS
 * runs this synchronous check-and-set to completion before any other caller's
 * code can run) and refuses everyone else until that probe's outcome is
 * recorded via `recordSuccess`/`recordFailure`.
 *
 * Most callers want `acquireAttempt` instead — this synchronous version is
 * exposed for callers that genuinely can't await (there are none today, but
 * it's the primitive `acquireAttempt` is built on).
 */
export function tryAcquireAttempt(key: BackendKey): boolean {
    const c = get(key);
    if (c.phase === 'open') return false;
    if (c.phase === 'half-open') {
        if (c.probeInFlight) return false;
        circuits.set(key, { ...c, probeInFlight: true });
        startProbeOutcome(key);
        return true;
    }
    return true;
}

const probeOutcomes = new Map<BackendKey, {
    promise: Promise<boolean>;
    resolve: (ok: boolean) => void;
    watchdog: ReturnType<typeof setTimeout>;
}>();

// Absolute ceiling on how long a half-open probe may hold its permit. Callers
// are expected to settle via recordSuccess/recordFailure, but a bug on any
// single path between acquiring the permit and settling it would otherwise
// wedge that backend permanently — every later caller would wait on a promise
// that never resolves. This is the independent safety net for that: longer
// than any request timeout, so it only ever fires when something genuinely
// went wrong rather than pre-empting a slow-but-live request.
const PROBE_WATCHDOG_MS = 60_000;

function startProbeOutcome(key: BackendKey): void {
    let resolveFn: (ok: boolean) => void = () => {};
    const promise = new Promise<boolean>(resolve => { resolveFn = resolve; });
    const watchdog = setTimeout(() => {
        // Treat a stranded probe as a failure: reopen so the normal cooldown
        // path takes over, and release anyone waiting behind it.
        if (circuits.get(key)?.phase === 'half-open') recordFailure(key);
        else settleProbeOutcome(key, false);
    }, PROBE_WATCHDOG_MS);
    probeOutcomes.set(key, { promise, resolve: resolveFn, watchdog });
}

function settleProbeOutcome(key: BackendKey, ok: boolean): void {
    const entry = probeOutcomes.get(key);
    if (entry) {
        clearTimeout(entry.watchdog);
        entry.resolve(ok);
        probeOutcomes.delete(key);
    }
}

/**
 * The async, "wait your turn" version of `tryAcquireAttempt` — what callers
 * should actually use. If the slot is free (closed, or half-open with no
 * probe running), grants it immediately, same as the sync version. If a
 * half-open probe is already in flight, waits for its outcome instead of
 * refusing outright: succeeds if the probe succeeded (the circuit is closed
 * now), refuses if it failed.
 */
export async function acquireAttempt(key: BackendKey): Promise<boolean> {
    if (tryAcquireAttempt(key)) return true;
    const entry = probeOutcomes.get(key);
    if (!entry) return tryAcquireAttempt(key); // open, or the race already settled
    const ok = await entry.promise;
    return ok ? tryAcquireAttempt(key) : false;
}

/** Record a reachable backend (any HTTP response). Closes the circuit. */
export function recordSuccess(key: BackendKey): void {
    clearCooldownTimer(key);
    const wasHalfOpen = circuits.get(key)?.phase === 'half-open';
    if (circuits.has(key)) circuits.set(key, { ...CLOSED_STATE });
    if (wasHalfOpen) settleProbeOutcome(key, true);
}

/**
 * Record a network-level failure. Opens the circuit once the threshold is
 * hit; a failed half-open probe reopens it with a longer backoff cooldown.
 * Failures arriving while already open are ignored — see the open-phase
 * branch below.
 */
export function recordFailure(key: BackendKey): void {
    const c = get(key);

    if (c.phase === 'open') {

        return;
    }

    if (c.phase === 'half-open') {
        openCircuit(key, c.failures + 1);
        settleProbeOutcome(key, false);
        return;
    }

    const failures = c.failures + 1;
    if (failures >= FAILURE_THRESHOLD) {
        openCircuit(key, failures);
    } else {
        circuits.set(key, { ...c, phase: 'closed', failures });
    }
}

type CooldownListener = () => void;
const cooldownListeners = new Set<CooldownListener>();
const cooldownTimers = new Map<BackendKey, ReturnType<typeof setTimeout>>();

function clearCooldownTimer(key: BackendKey): void {
    const existing = cooldownTimers.get(key);
    if (existing) {
        clearTimeout(existing);
        cooldownTimers.delete(key);
    }
}

function armCooldownTimer(key: BackendKey, openUntil: number): void {
    clearCooldownTimer(key);
    const delay = Math.max(0, openUntil - Date.now());
    cooldownTimers.set(key, setTimeout(() => {
        cooldownTimers.delete(key);
        const c = circuits.get(key);
        if (c && c.phase === 'open') {
            circuits.set(key, { ...c, phase: 'half-open', probeInFlight: false });
        }
        notifyCooldownExpired();
    }, delay));
}

function notifyCooldownExpired(): void {
    cooldownListeners.forEach(listener => {
        try { listener(); } catch { /* one listener's failure shouldn't stop the others */ }
    });
}

/**
 * Registers a callback to run whenever any circuit's cooldown naturally
 * expires (transitions open → half-open). Returns an unsubscribe function.
 * Not tied to any specific key — callers that care which backend recovered
 * should re-check `isBackendDown` themselves; this is purely a "something may
 * be worth retrying now" nudge. Note the transition only opens the door to a
 * single probe attempt, not a free-for-all — see `tryAcquireAttempt`.
 */
export function onCircuitCooldownExpired(listener: CooldownListener): () => void {
    cooldownListeners.add(listener);
    return () => cooldownListeners.delete(listener);
}

/** Force a backend back to healthy (e.g. after connectivity is restored). */
export function resetCircuit(key: BackendKey): void {
    circuits.delete(key);
    clearCooldownTimer(key);
    settleProbeOutcome(key, true);
}

/**
 * Force every circuit (every country/backend combination) back to healthy.
 * Used when connectivity is restored and the country of any given open circuit
 * isn't known at the call site — give everything a fresh chance rather than
 * trying to enumerate keys.
 */
export function resetAllCircuits(): void {
    circuits.clear();
    cooldownTimers.forEach(timer => clearTimeout(timer));
    cooldownTimers.clear();
    Array.from(probeOutcomes.keys()).forEach(key => settleProbeOutcome(key, true));
}

/** Thrown when a call is short-circuited because its backend is known to be down. */
export class NetworkUnavailableError extends Error {
    readonly backend: BackendKey;
    readonly isOffline = true;
    constructor(backend: BackendKey) {
        super(`${backend} is currently unreachable`);
        this.name = 'NetworkUnavailableError';
        this.backend = backend;
    }
}

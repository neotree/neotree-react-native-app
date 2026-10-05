/**
 * The decisions the export pipeline makes, separated from the I/O that acts on
 * them: which sessions are owed a delivery, how a failure is classified, when
 * a quarantined session gets another attempt, and when a drain should stop.
 *
 * `exportSessions.ts` imports React Native and cannot load under Node, so this
 * module holds everything that needs to be tested and keeps no imports beyond
 * other pure modules.
 */
import { NetworkUnavailableError } from './circuitBreaker';

export type ExportDestination = 'main' | 'poll' | 'local';
export type ExportFailureKind = 'network' | 'http' | 'conversion' | 'configuration' | 'unknown';

export interface ClassifiedFailure {
    kind: ExportFailureKind;
    message: string;
    retryable: boolean;
}

// --- Quarantine -----------------------------------------------------------------

/**
 * How long a quarantined session waits before the background sweep tries it
 * again. Quarantine stops one bad row from retrying in a tight loop; without a
 * release, a row quarantined by something since fixed (a server-side 400, a
 * config problem) would never be exported unless someone noticed it.
 */
export const QUARANTINE_RETRY_AFTER_MS = 24 * 60 * 60 * 1000;

/** Sessions quarantined before this instant are due another attempt. */
export function quarantineReleaseCutoff(now: number = Date.now()): string {
    return new Date(now - QUARANTINE_RETRY_AFTER_MS).toISOString();
}

export function isQuarantined(session: any): boolean {
    return Boolean(session?.main_export_blocked || session?.poll_export_blocked || session?.local_export_blocked);
}

/**
 * Whether a quarantined session's wait is over. A session quarantined before
 * the timestamp existed has none, and counts as expired: those are precisely
 * the sessions that were stranded.
 */
export function isQuarantineExpired(session: any, now: number = Date.now()): boolean {
    if (!isQuarantined(session)) return false;
    const blockedAt = Date.parse(session?.export_blocked_at || '');
    if (!Number.isFinite(blockedAt)) return true;
    return blockedAt <= now - QUARANTINE_RETRY_AFTER_MS;
}

// --- Failure classification -------------------------------------------------------

function isNetworkError(error: any, message: string): boolean {
    return error instanceof NetworkUnavailableError
        // Matched by name as well: a second copy of the class (e.g. across a
        // bundle boundary) would fail instanceof.
        || error?.name === 'NetworkUnavailableError'
        || error?.name === 'AbortError'
        || /network request|timed out|unreachable|offline/i.test(message);
}

/**
 * Network failures are retried; configuration and conversion failures are not,
 * because retrying cannot fix them and they would starve newer sessions.
 */
export function classifyExportError(error: any, kind?: ExportFailureKind): ClassifiedFailure {
    const message = error instanceof Error ? error.message : `${error || 'Unknown export error'}`;
    if (kind === 'conversion') return { kind, message, retryable: false };
    if (isNetworkError(error, message)) return { kind: 'network', message, retryable: true };
    if (/config|location not set|cannot read propert/i.test(message)) {
        return { kind: 'configuration', message, retryable: false };
    }
    return { kind: kind || 'unknown', message, retryable: true };
}

// --- Draining an explicit selection ---------------------------------------------------

/**
 * Whether a batch shows the backends are unreachable: nothing got through and
 * every failure was the network. Their circuits are open by then, so further
 * batches would only fail too, and the drain should stop and leave the rest to
 * the retry schedule.
 */
export function batchFoundBackendsDown(input: {
    deliveredBefore: number;
    deliveredAfter: number;
    newFailures: { kind: ExportFailureKind }[];
}): boolean {
    const progressed = input.deliveredAfter > input.deliveredBefore;
    const networkOnly = input.newFailures.length > 0
        && input.newFailures.every(failure => failure.kind === 'network');
    return !progressed && networkOnly;
}

// --- Which sessions are owed a delivery -------------------------------------------------

export interface PendingFilterOptions {
    /** Countries whose sessions also owe a poll delivery. */
    pollingCountries: string[];
    /** Sessions created before this never had poll delivery tracked. */
    pollTrackingStartedAt: string;
    /** The site whose sessions owe the local server, when one is configured. */
    local?: { country: string; hospital: string } | null;
    /**
     * Quarantined sessions blocked before this ISO instant are included again.
     * Omit to leave every quarantined session out.
     */
    releaseBlockedBefore?: string | null;
}

/**
 * The "still owed somewhere" WHERE clause: completed, not cancelled, and
 * missing at least one delivery it has not been quarantined from.
 *
 * Shared by the sweep and the pending count so they never disagree about what
 * is outstanding.
 */
export function pendingSessionFilter(options: PendingFilterOptions): { sql: string; params: any[] } {
    const params: any[] = [];

    // Booleans are compared against 1 rather than bound: sqlite stores them as
    // integers, and not every driver can bind a JS boolean.
    const notBlocked = (column: string) => {
        if (!options.releaseBlockedBefore) return `COALESCE(${column}, 0) = 0`;
        params.push(options.releaseBlockedBefore);
        return `(COALESCE(${column}, 0) = 0 OR COALESCE(export_blocked_at, '') < ?)`;
    };

    const pending: string[] = [`(exported IS NOT 1 AND ${notBlocked('main_export_blocked')})`];

    if (options.pollingCountries.length) {
        const blocked = notBlocked('poll_export_blocked');
        pending.push(`(
            poll_exported IS NOT 1
            AND ${blocked}
            AND COALESCE(createdAt, json_extract(data, '$.started_at')) >= ?
            AND json_extract(data, '$.country') IN (${options.pollingCountries.map(() => '?').join(',')})
        )`);
        params.push(options.pollTrackingStartedAt, ...options.pollingCountries);
    }

    if (options.local?.country && options.local?.hospital) {
        const blocked = notBlocked('local_export_blocked');
        pending.push(`(
            local_export IS NOT 1
            AND ${blocked}
            AND json_extract(data, '$.country') = ?
            AND TRIM(json_extract(data, '$.hospital_id')) = ?
        )`);
        params.push(options.local.country, options.local.hospital.trim());
    }

    return {
        sql: `WHERE json_valid(data)
            AND json_extract(data, '$.completed_at') IS NOT NULL
            AND json_extract(data, '$.canceled_at') IS NULL
            AND (${pending.join(' OR ')})`,
        params,
    };
}

/** Completed sessions that are quarantined from at least one destination. */
export const QUARANTINED_SESSION_FILTER = `WHERE json_valid(data)
    AND json_extract(data, '$.completed_at') IS NOT NULL
    AND json_extract(data, '$.canceled_at') IS NULL
    AND (COALESCE(main_export_blocked, 0) = 1
        OR COALESCE(poll_export_blocked, 0) = 1
        OR COALESCE(local_export_blocked, 0) = 1)`;

// --- Sessions exported by other devices -------------------------------------------------

/**
 * Reads the `/last-ingested-sessions` body.
 *
 * The client used to `JSON.parse` the result of `res.json()`, which throws on
 * an ordinary JSON object - so the sync of sessions exported by other devices
 * failed every time, silently. This accepts the raw text, a parsed body, or a
 * double-encoded string (which that old code assumed), and never throws.
 */
export function parseLastIngestedResponse(body: unknown): { error: string | null; sessions: any[] } {
    let parsed: any = body;
    // Twice at most: once for the text itself, once for a double-encoded body.
    for (let depth = 0; depth < 2 && typeof parsed === 'string'; depth += 1) {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return { error: 'The server returned a response that is not JSON.', sessions: [] };
        }
    }
    if (!parsed || typeof parsed !== 'object') {
        return { error: 'The server returned an empty response.', sessions: [] };
    }
    if (parsed.error) {
        return { error: `${parsed.error?.message || parsed.error}`, sessions: [] };
    }
    return { error: null, sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [] };
}

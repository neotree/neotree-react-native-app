import type { Backend } from '@/src/data/circuitBreaker';
import { handleAppCrush, normaliseError, safeStringify } from './handleCrashes';

/**
 * Where an exception came from: one of the backends the app talks to, or the
 * app itself for a client-side fault.
 */
export type ErrorSource = Backend | 'app';

/**
 * How much attention a report deserves.
 * - `fatal`   — the app crashed or is about to.
 * - `error`   — an operation failed; the user is affected.
 * - `warning` — recovered, but something is wrong (bad script config, corrupt
 *               payload, a non-200 the caller handled).
 */
export type ErrorLevel = 'fatal' | 'error' | 'warning';

export type LogOptions = {
    /** Overrides the source inferred from the error. */
    source?: ErrorSource;
    /** Defaults to 'error'. */
    level?: ErrorLevel;
};

const SOURCES: ErrorSource[] = ['app', 'webeditor', 'nodeapi', 'local'];

/**
 * Work out which backend a failure belongs to.
 *
 * makeApiCall/makeLocalApiCall tag the errors they throw (see tagErrorSource in
 * data/api.ts) and NetworkUnavailableError carries the backend it was raised
 * for, so an API failure is attributed correctly without every catch block in
 * the app having to name a source. Anything untagged is a client-side fault.
 */
function resolveSource(error: any, explicit?: ErrorSource): ErrorSource {
    if (explicit) return explicit;
    try {
        const tagged = error?.source ?? error?.backend;
        if (typeof tagged === 'string') {
            // NetworkUnavailableError is raised with a plain backend name, but
            // accept a "country:backend" circuit key too.
            const match = SOURCES.find(s => tagged === s || tagged.includes(`:${s}`));
            if (match) return match;
        }
    } catch {
        // A throwing getter on the error object. Fall through to 'app'.
    }
    return 'app';
}

function report(
    level: ErrorLevel,
    context: string,
    error?: unknown,
    extra?: Record<string, unknown>,
    opts?: LogOptions,
): void {
    try {
        const { message, stack } = normaliseError(error);

        if (__DEV__) {
            // Console output is dev-only and never ships, so the log stays
            // clean on a device while a developer still sees faults live.
            const print = level === 'warning' ? console.warn : console.error;
            print(`[${context}]`, message, extra ?? '');
        }

        handleAppCrush(
            {
                message: `[${context}] ${message}`,
                stack: extra ? `${stack}\n${safeStringify(extra)}` : stack,
            },
            resolveSource(error, opts?.source),
            opts?.level ?? level,
            extra,
        );
    } catch {
        // Never let reporting break the path that was already failing.
    }
}

/**
 * Report a failed operation. This is the app's only logging entry point.
 *
 * Nothing is sent over the network here. The report is written to the local
 * `exceptions` table and drained on the next successful sync, so a fault that
 * happens offline — which is when faults here are most likely — still reaches
 * the server once connectivity returns, instead of being dropped by a failed
 * request.
 *
 * Fire-and-forget and never throws, so it is safe in any catch block. A fault
 * already seen this session costs a Set lookup and an integer increment: no
 * database access, no native calls.
 *
 * @param context Stable label for the call site, e.g. 'exportSessions.local'.
 *                Reports are deduped on context + message + source, so keep it
 *                free of ids and other per-call values — those go in `extra`.
 * @param error   Whatever was caught. Error, string, or arbitrary object.
 * @param extra   Diagnostic detail. Scrubbed before it is stored or synced, so
 *                patient data cannot leave the device by accident.
 */
export function logError(
    context: string,
    error?: unknown,
    extra?: Record<string, unknown>,
    opts?: LogOptions,
): void {
    report('error', context, error, extra, opts);
}

/**
 * Report something the app recovered from but that still needs looking at —
 * a misconfigured script, a corrupt payload, a non-200 the caller handled.
 * Same guarantees as {@link logError}.
 */
export function logWarning(
    context: string,
    error?: unknown,
    extra?: Record<string, unknown>,
    opts?: LogOptions,
): void {
    report('warning', context, error, extra, opts);
}

/**
 * Report a crash. Used by the global handlers and the error boundary; prefer
 * {@link logError} everywhere else.
 */
export function logFatal(
    context: string,
    error?: unknown,
    extra?: Record<string, unknown>,
    opts?: LogOptions,
): void {
    report('fatal', context, error, extra, opts);
}

import type { Backend } from '@/src/data/circuitBreaker';
import { handleAppCrush, normaliseError, safeStringify } from './handleCrashes';

/**
 * Where an exception came from: one of the backends the app talks to, or the
 * app itself for a client-side fault.
 */
export type ErrorSource = Backend | 'app';

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

/**
 * The single entry point for reporting a runtime error.
 *
 * Errors are written to the local `exceptions` table rather than POSTed
 * straight to a backend. That table is drained on the next successful sync, so
 * a fault that happens while the device is offline — which is when faults here
 * are most likely — still reaches the server once connectivity returns,
 * instead of being dropped by a failed request.
 *
 * Fire-and-forget and never throws, so it is safe to call from any catch block
 * without changing the control flow that was already failing.
 *
 * @param context Stable label for the call site, e.g. 'exportSessions.local'.
 *                Errors are deduped on `[context] message` plus source, so keep
 *                it free of ids and other per-call values — those go in `extra`.
 * @param error   Whatever was caught. Error, string, or arbitrary object.
 * @param extra   Optional diagnostic detail, recorded alongside the stack.
 * @param source  Overrides the source inferred from `error`. Only needed when
 *                reporting a backend problem that isn't itself a thrown API
 *                error, e.g. a non-200 response the caller handled.
 */
export function logError(
    context: string,
    error?: unknown,
    extra?: Record<string, unknown>,
    source?: ErrorSource,
): void {
    try {
        const { message, stack } = normaliseError(error);
        const details = extra && Object.keys(extra).length ? `\n${safeStringify(extra)}` : '';

        handleAppCrush(
            {
                message: `[${context}] ${message}`,
                stack: `${stack}${details}`,
            },
            resolveSource(error, source),
        );
    } catch {
        // Never let reporting break the path that was already failing.
    }
}

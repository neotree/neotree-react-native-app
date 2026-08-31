import { handleAppCrush, normaliseError, safeStringify } from './handleCrashes';

/**
 * The single entry point for reporting a runtime error.
 *
 * Errors are written to the local `exceptions` table rather than POSTed
 * straight to the backend. That table is drained by syncData() on the next
 * successful sync, so a fault that happens while the device is offline — which
 * is when faults here are most likely — still reaches the server once
 * connectivity returns, instead of being dropped by a failed request.
 *
 * Fire-and-forget and never throws, so it is safe to call from any catch block
 * without changing the control flow that was already failing.
 *
 * @param context Stable label for the call site, e.g. 'exportSessions.local'.
 *                Errors are deduped on `[context] message`, so keep it free of
 *                ids and other per-call values — put those in `extra`.
 * @param error   Whatever was caught. Error, string, or arbitrary object.
 * @param extra   Optional diagnostic detail, recorded alongside the stack.
 */
export function logError(context: string, error?: unknown, extra?: Record<string, unknown>): void {
    try {
        const { message, stack } = normaliseError(error);
        const details = extra && Object.keys(extra).length ? `\n${safeStringify(extra)}` : '';

        handleAppCrush({
            message: `[${context}] ${message}`,
            stack: `${stack}${details}`,
        });
    } catch {
        // Never let reporting break the path that was already failing.
    }
}

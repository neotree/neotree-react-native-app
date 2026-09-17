import { logFatal, logError } from './logError';
import { addBreadcrumb } from './breadcrumbs';

// The ErrorBoundary in App.tsx only catches errors thrown during a React
// render. Two large classes of production fault go completely unreported
// without the handlers below:
//
//  - A throw in an event handler, a timer, or any async callback. These unwind
//    past React entirely and land on the runtime's global handler.
//  - A rejected promise nobody caught. Silent today — no red box, no crash,
//    no record; the operation just quietly never completes.
//
// Both are installed once at startup and chain to whatever was already there,
// so React Native's own red box in development and its crash behaviour in
// production are preserved exactly.

let installed = false;

export function installGlobalErrorHandlers(): void {
    if (installed) return;
    installed = true;

    const globals = globalThis as any;

    // --- Uncaught JS errors -------------------------------------------------
    try {
        const errorUtils = globals.ErrorUtils;
        if (errorUtils?.setGlobalHandler) {
            const previous = errorUtils.getGlobalHandler?.();
            errorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
                logFatal('global.uncaught', error, { isFatal: !!isFatal });
                // Chain, so the red box still shows in dev and the app still
                // crashes in production rather than continuing in a bad state.
                try {
                    previous?.(error, isFatal);
                } catch {
                    // The previous handler is not ours to fix.
                }
            });
        }
    } catch {
        // Never let instrumentation stop the app from starting.
    }

    // --- Unhandled promise rejections ---------------------------------------
    try {
        const tracker = globals.HermesInternal?.enablePromiseRejectionTracker;
        if (typeof tracker === 'function') {
            tracker({
                allRejections: true,
                onUnhandled: (id: number, rejection: any) => {
                    logError('global.unhandledRejection', rejection, { rejectionId: id });
                },
                onHandled: () => {
                    // Rejection was handled late. Already reported; the report
                    // is still worth keeping, so there is nothing to undo.
                },
            });
        }
    } catch {
        // Not running on Hermes, or the tracker is unavailable on this build.
    }

    addBreadcrumb('app', 'global error handlers installed');
}

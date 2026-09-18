let chain: Promise<unknown> = Promise.resolve();

/** Runs queued or running. Queued counts as in progress: the work is owed. */
let activeRuns = 0;

type RunningListener = (running: boolean) => void;
const listeners = new Set<RunningListener>();

function notify() {
    const running = activeRuns > 0;
    listeners.forEach(listener => {
        try { listener(running); } catch { /* a listener must not break the lock */ }
    });
}

/** Whether any export is in flight, so the UI can say so instead of starting another. */
export function isExportRunning(): boolean {
    return activeRuns > 0;
}

/** Subscribes to export start/finish. Returns the unsubscribe. */
export function onExportRunningChange(listener: RunningListener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

/**
 * Serializes session exports so overlapping triggers (auto-export after saving
 * a session, manual export from the Sessions screen) can never POST the same
 * session concurrently. Queued runs re-read the exported flags from the local
 * db, so a session exported by an earlier run becomes a no-op in the next one.
 */
export function withExportLock<T>(fn: () => Promise<T>): Promise<T> {
    activeRuns += 1;
    notify();

    const run = chain.then(fn);
    chain = run.then(() => undefined, () => undefined);

    const settle = () => {
        activeRuns = Math.max(0, activeRuns - 1);
        notify();
    };
    run.then(settle, settle);

    return run;
}

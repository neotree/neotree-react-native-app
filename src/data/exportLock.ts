let chain: Promise<unknown> = Promise.resolve();

/**
 * Serializes session exports so overlapping triggers (auto-export after saving
 * a session, manual export from the Sessions screen) can never POST the same
 * session concurrently. Queued runs re-read the exported flags from the local
 * db, so a session exported by an earlier run becomes a no-op in the next one.
 */
export function withExportLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = chain.then(fn);
    chain = run.then(() => undefined, () => undefined);
    return run;
}

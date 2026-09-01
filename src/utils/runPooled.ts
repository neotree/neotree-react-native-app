/**
 * Run `worker` over `items` with at most `concurrency` in flight.
 *
 * Lanes pull from a shared cursor, so a slow item does not hold up the others
 * the way a fixed chunking would. `stop` is checked before each item is picked
 * up, which lets a caller abandon the rest of the queue the moment a circuit
 * breaker opens — there is no point queueing requests at a backend already
 * known to be down.
 *
 * @returns the items never picked up, i.e. those deferred because `stop`
 *          returned true.
 */
export async function runPooled<T>(
    items: T[],
    concurrency: number,
    stop: () => boolean,
    worker: (item: T, index: number) => Promise<void>,
): Promise<T[]> {
    let cursor = 0;
    const lanes = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (cursor < items.length) {
            if (stop()) return;
            const i = cursor++;
            await worker(items[i], i);
        }
    });
    await Promise.allSettled(lanes);
    return items.slice(cursor);
}

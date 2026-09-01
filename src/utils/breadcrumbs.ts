import { scrubExtra } from './scrub';

// A stack trace says where the app broke. Breadcrumbs say what was happening
// when it did — which screen, which sync, which request — and that is usually
// what actually identifies the bug.
//
// The trail lives in memory in a fixed-size ring, so recording one is an array
// push and nothing else: no I/O, no serialisation, no allocation growth. It is
// only read (and serialised) at the moment an exception is recorded.

export type BreadcrumbCategory = 'nav' | 'api' | 'sync' | 'session' | 'script' | 'app';

export type Breadcrumb = {
    /** ms since the trail started, not a wall clock — smaller, and enough to order events. */
    t: number;
    category: BreadcrumbCategory;
    message: string;
    data?: Record<string, unknown>;
};

const MAX_BREADCRUMBS = 30;

const trail: Breadcrumb[] = [];
const startedAt = Date.now();

/**
 * Record what the app just did. Safe to call anywhere and never throws; a
 * breadcrumb is a diagnostic aid, never a reason to fail a real operation.
 */
export function addBreadcrumb(
    category: BreadcrumbCategory,
    message: string,
    data?: Record<string, unknown>,
): void {
    try {
        trail.push({
            t: Date.now() - startedAt,
            category,
            message,
            // Scrubbed on the way in: a breadcrumb is synced with the exception
            // it is attached to, so it needs the same protection as `extra`.
            data: scrubExtra(data),
        });
        // Ring: drop the oldest once full, so memory is bounded regardless of
        // how long the app stays open.
        while (trail.length > MAX_BREADCRUMBS) trail.shift();
    } catch {
        // Never let instrumentation break the path being instrumented.
    }
}

/** The current trail, oldest first. */
export function getBreadcrumbs(): Breadcrumb[] {
    return trail.slice();
}

export function clearBreadcrumbs(): void {
    trail.length = 0;
}

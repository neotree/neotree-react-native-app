/**
 * A script's Screen review list: entries { label, screen } for the review page at the end of a script, where
 * `screen` is the `screen_id` of one of the script's screens. A screen deleted in the editor may still be named
 * in a list synced earlier; listing it would show an item that goes nowhere, so entries for screens the
 * tablet doesn't have are dropped. An entry with no screen chosen is left alone.
 *
 * Kept free of app imports so it can be unit tested (scripts/tests/review-configurations.test.ts).
 */
export type ReviewEntry = { label?: string; screen?: string | null };

function toEntries(value: unknown): ReviewEntry[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

const text = (v: unknown) => `${v ?? ''}`.trim();

export function keepExistingScreens(entries: unknown, screens: { screen_id?: unknown }[] | null | undefined): ReviewEntry[] {
    const known = new Set((screens || []).map(s => text(s?.screen_id)).filter(Boolean));
    return toEntries(entries).filter(e => !text(e?.screen) || known.has(text(e.screen)));
}

import { generateMuid } from './muid';

/**
 * Rules that keep a tablet's UIDs from repeating. Kept free of app imports so they can be unit tested
 * (scripts/tests/uid-counter.test.ts).
 *
 * A UID is the tablet's prefix plus a counter (`total_sessions_recorded`). The counter lives in the
 * app's own database, which a reinstall, "clear data" or an Android backup restore can wipe or roll
 * back. The editor remembers the highest count this tablet reported, so a tablet whose counter is
 * behind it resumes from where the editor says (that count plus a safety margin): numbers may be
 * skipped but are never reused.
 */

const toCount = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/**
 * The counter to keep. Unchanged while it is at or ahead of what the editor knows. When it is behind
 * (reset or restored), the editor's `uid_counter_floor`, or, from an editor that doesn't send one yet,
 * at least its reported count.
 */
export function resolveSessionCounter(params: {
    local?: unknown;
    serverCount?: unknown;
    serverFloor?: unknown;
}): number {
    const local = toCount(params.local);
    const serverCount = toCount(params.serverCount);
    if (local >= serverCount) return local;
    return Math.max(toCount(params.serverFloor), serverCount);
}

/**
 * The prefix this tablet's UIDs start with: the one it already has, otherwise the one the editor
 * assigned. There is no default: a made-up shared prefix would let two tablets issue the same UID.
 */
export function resolveUidPrefix(stored?: string | null, assigned?: string | null): string {
    const prefix = `${stored || assigned || ''}`.trim();
    if (!prefix) throw new Error('The editor has not assigned this tablet an ID prefix yet. Connect to the editor and try again.');
    return prefix;
}

/**
 * Whether the tablet should (re)send its counter to the editor: only when it is ahead of what the
 * editor reported back. Sending on every check-in, not just after a new session, repairs any upload
 * that was lost to a missing connection.
 */
export function shouldReportCounter(local?: unknown, serverCount?: unknown): boolean {
    return toCount(local) > toCount(serverCount);
}

/**
 * A session UID for the tablet's prefix and counter value (the number of this session, 1 for the first).
 *
 *   nuid  FB8E-1230042   prefix, a dash, 3 extra random digits, then the counter's last 4 digits (unchanged)
 *   muid  M0K7Q-000001R  see ./muid; the counter has 6 base-32 characters, so it never wraps in practice
 *
 * `extraDigits` is only used for NUIDs. Throws when the prefix can't be used (a MUID needs a tablet
 * ID of 4 characters from 0-9 and A-Z without I, L, O, U).
 */
export function buildUid(params: { prefix: string; counter: number; idType?: 'nuid' | 'muid'; extraDigits?: string }): string {
    const { prefix, counter, idType = 'nuid', extraDigits = '' } = params;
    if (!`${prefix || ''}`.trim()) throw new Error('This tablet has no ID prefix yet. Sync with the editor first.');
    if (idType === 'muid') return generateMuid(prefix, counter);
    return `${prefix}-${extraDigits}${`000${counter}`.slice(-4)}`;
}

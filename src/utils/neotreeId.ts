/**
 * Neotree ID input formatting.
 *
 * An ID is a 4-character device prefix, a separator, and a numeric suffix
 * (`FB8E-1230042`) - see `generateUID`. Kept free of app imports so the rules
 * can be unit tested.
 */

import { MUID_LETTER, MUID_STORED_LENGTH, formatMuid, formatMuidInput, normaliseMuid } from './muid';

export const NEOTREE_ID_PREFIX_LENGTH = 4;
export const NEOTREE_ID_SUFFIX_LENGTH = 7;
/** The longest an ID can be as typed: a MUID with its hyphen (M0K7Q-000001R). A NUID is 12. */
export const NEOTREE_ID_MAX_LENGTH = MUID_STORED_LENGTH;

/**
 * A MUID always starts with the letter M, which a NUID prefix (hex digits only) never does, so the
 * first character is enough to tell what is being typed.
 */
export function looksLikeMuid(raw = ''): boolean {
    return normaliseMuid(raw).startsWith(MUID_LETTER);
}

/** The text to search sessions for: a MUID is searched in its stored form (M0K7Q-000001R), however it was typed. */
export function normaliseUidSearch(value = ''): string {
    const trimmed = `${value || ''}`.trim();
    return looksLikeMuid(trimmed) ? formatMuid(trimmed) : trimmed.replace(/-+$/, '');
}

/**
 * Formats what the user has typed into an ID: upper-cases it, drops characters
 * an ID cannot contain, and inserts the separator once the prefix is complete
 * so it never has to be typed.
 *
 * `previous` is the currently displayed value. It is needed to tell typing from
 * deleting: without it, backspacing over an auto-inserted separator would
 * immediately re-insert it and trap the cursor.
 */
export function formatNeotreeIDInput(raw = '', previous = ''): string {
    if (looksLikeMuid(raw)) return formatMuidInput(raw, previous);
    const cleaned = `${raw || ''}`.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const prefix = cleaned.slice(0, NEOTREE_ID_PREFIX_LENGTH);
    const suffix = cleaned.slice(
        NEOTREE_ID_PREFIX_LENGTH,
        NEOTREE_ID_PREFIX_LENGTH + NEOTREE_ID_SUFFIX_LENGTH,
    );

    if (suffix) return `${prefix}-${suffix}`;
    if (prefix.length < NEOTREE_ID_PREFIX_LENGTH) return prefix;

    // The prefix is complete and nothing follows it. Keep the separator unless
    // this change was a deletion that removed it, so one backspace steps out of
    // the suffix and the next removes the separator itself.
    const deleting = `${raw || ''}`.length < `${previous || ''}`.length;
    const keptSeparator = `${raw || ''}`.includes('-');
    return (deleting && !keptSeparator) ? prefix : `${prefix}-`;
}

import * as types from '@/src/types';

/** Splits "a, b(c, d), 'e,f'" on top-level commas (outside parentheses and quotes). */
export function splitTopLevelArgs(text: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let quote: string | null = null;
    let from = 0;

    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (quote) {
            if (ch === quote) quote = null;
        } else if (ch === "'" || ch === '"') {
            quote = ch;
        } else if (ch === '(') {
            depth += 1;
        } else if (ch === ')') {
            depth -= 1;
        } else if (ch === ',' && depth === 0) {
            out.push(text.slice(from, i).trim());
            from = i + 1;
        }
    }
    out.push(text.slice(from).trim());
    return out;
}

/**
 * Returns the inside of `NAME( ... )` when `formula` is exactly one such call, else null.
 * The closing parenthesis must be the last character and must match the opening one.
 */
export function unwrapCall(formula: string, name: string): string | null {
    const text = `${formula || ''}`.trim();
    if (!text.startsWith(`${name}(`) || !text.endsWith(')')) return null;
    let depth = 0;
    let quote: string | null = null;
    for (let i = name.length; i < text.length; i += 1) {
        const ch = text[i];
        if (quote) { if (ch === quote) quote = null; continue; }
        if (ch === "'" || ch === '"') { quote = ch; continue; }
        if (ch === '(') depth += 1;
        if (ch === ')') {
            depth -= 1;
            if (depth === 0 && i !== text.length - 1) return null;
        }
    }
    return depth === 0 ? text.slice(name.length + 1, -1) : null;
}

/** Keys referenced as $Key in a formula (case preserved, de-duplicated). */
export function getReferencedKeys(formula: string): string[] {
    const keys = new Set<string>();
    for (const m of `${formula || ''}`.matchAll(/\$([A-Za-z_][A-Za-z0-9_]*)/g)) keys.add(m[1]);
    return Array.from(keys);
}

export function findEntry(values: types.ScreenEntryValue[], key: string) {
    const lower = `${key}`.toLowerCase();
    return (values || []).find(v => `${v?.key ?? ''}`.toLowerCase() === lower);
}

/** Missing, null or blank. A whitespace-only string is blank: Number('   ') is 0, which would pass as a real value. */
export const isEmptyValue = (value: unknown) =>
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

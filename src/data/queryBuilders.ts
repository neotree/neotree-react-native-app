/**
 * SQL fragment builders shared by the local-db queries.
 *
 * Kept free of expo-sqlite (and every other native import) so the rules can be
 * unit tested the same way the delivery rules are.
 */

/**
 * Column names come from callers inside this repo, never from user input, but
 * they are still interpolated into SQL, so anything that is not a plain
 * identifier is rejected rather than quoted. Values are always bound.
 */
const COLUMN_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface WhereClause {
    sql: string;
    params: any[];
}

/**
 * Builds an AND-joined, fully parameterised WHERE clause.
 *
 * The previous inline version joined conditions with a comma and interpolated
 * `JSON.stringify(value)`, which produced invalid SQL for more than one
 * condition and relied on SQLite's double-quote fallback for string literals.
 */
export function buildWhere(where: Record<string, any> = {}): WhereClause {
    const columns = Object.keys(where || {});
    const invalid = columns.filter(column => !COLUMN_NAME.test(column));
    if (invalid.length) throw new Error(`Invalid column name(s) in query filter: ${invalid.join(', ')}`);
    if (!columns.length) return { sql: '', params: [] };
    return {
        sql: ` where ${columns.map(column => `${column}=?`).join(' and ')}`,
        params: columns.map(column => where[column]),
    };
}

/**
 * Builds an ORDER BY clause from `[[column, direction], ...]`, dropping any
 * clause whose column is not a plain identifier. Directions other than
 * ASC/DESC are omitted so SQLite applies its default rather than failing.
 */
export function buildOrder(_order: any, fallback: any[] = []): string {
    const order = Array.isArray(_order) ? _order : fallback;
    const clauses = order
        .filter((keyVal: any) => Array.isArray(keyVal))
        .map(([column, direction]: any) => {
            if (!COLUMN_NAME.test(`${column || ''}`)) return '';
            const dir = `${direction || ''}`.toUpperCase();
            return `${column}${dir === 'ASC' || dir === 'DESC' ? ` ${dir}` : ''}`;
        })
        .filter((clause: string) => clause);
    return clauses.length ? ` order by ${clauses.join(',')}` : '';
}

/** Rows whose `data` column holds JSON, parsed and defaulted to `{}`. */
export function withParsedData(rows: any[] = []): any[] {
    return rows.map(row => ({ ...row, data: JSON.parse(row.data || '{}') }));
}

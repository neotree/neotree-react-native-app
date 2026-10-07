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

// --- Session history ------------------------------------------------------------

/**
 * Sessions recorded at one site. Matches `sessions_location_idx`, which is
 * partial on json_valid(data), so the filter and the ordering both use it.
 */
export const SESSIONS_FOR_LOCATION_WHERE = `WHERE json_valid(data)
    AND json_extract(data, '$.country') = ?
    AND TRIM(json_extract(data, '$.hospital_id')) = ?`;

export function locationParams(country: string, hospital: string): any[] {
    return [country, `${hospital || ''}`.trim()];
}

/** Newest first; id breaks ties so the order is total and paging is exact. */
export const SESSIONS_NEWEST_FIRST = 'ORDER BY createdAt DESC, id DESC';

/** Where the previous page ended: its last row. */
export interface SessionsCursor {
    createdAt: string | null;
    id: number;
}

export function sessionsCursorAfter(row: any): SessionsCursor | null {
    if (!row || row.id === undefined || row.id === null) return null;
    return { createdAt: row.createdAt ?? null, id: Number(row.id) };
}

/**
 * One page of a site's sessions, newest first, starting after `cursor`.
 *
 * Keyset rather than OFFSET: OFFSET counts rows, so a row deleted or added
 * between pages shifts every later row by one and a session is skipped or
 * shown twice. A cursor names the last row seen, so the next page starts
 * exactly after it however the rows around it change.
 *
 * SQLite sorts NULL below every value, so in descending order rows with no
 * createdAt come last; the predicate follows the same rule.
 */
export function sessionsPageQuery(input: {
    country: string;
    hospital: string;
    limit: number;
    cursor?: SessionsCursor | null;
}): { sql: string; params: any[] } {
    const params: any[] = locationParams(input.country, input.hospital);
    let after = '';

    if (input.cursor) {
        if (input.cursor.createdAt === null) {
            after = 'AND createdAt IS NULL AND id < ?';
            params.push(input.cursor.id);
        } else {
            after = `AND (createdAt < ? OR (createdAt = ? AND id < ?) OR createdAt IS NULL)`;
            params.push(input.cursor.createdAt, input.cursor.createdAt, input.cursor.id);
        }
    }

    // One extra row tells the caller whether another page exists.
    params.push(Math.max(1, input.limit) + 1);
    return {
        sql: `SELECT * FROM sessions
            ${SESSIONS_FOR_LOCATION_WHERE}
            ${after}
            ${SESSIONS_NEWEST_FIRST}
            LIMIT ?;`,
        params,
    };
}

/** Upper bound of the uid range that starts with `prefix`. */
function prefixUpperBound(prefix: string): string {
    // U+FFFF sorts after every character an id can contain.
    return `${prefix}￿`;
}

/** Removes characters that would act as LIKE wildcards inside the term. */
export function normaliseUIDSearchTerm(term: string): string {
    return `${term || ''}`.trim().toUpperCase().replace(/[%_\\]/g, '');
}

/**
 * Neotree ID search at one site.
 *
 * `prefix` is how ids are typed and is served by an index on upper(uid);
 * `substring` matches anywhere, including ids stored only inside `data` by
 * older rows, and needs a scan - so it is the fallback, not the default.
 */
export function sessionsUIDSearchQuery(input: {
    country: string;
    hospital: string;
    term: string;
    limit: number;
    mode: 'prefix' | 'substring';
}): { sql: string; params: any[] } {
    const term = normaliseUIDSearchTerm(input.term);
    const params: any[] = locationParams(input.country, input.hospital);
    let match: string;

    if (input.mode === 'prefix') {
        match = 'AND upper(uid) >= ? AND upper(uid) < ?';
        params.push(term, prefixUpperBound(term));
    } else {
        match = `AND upper(COALESCE(NULLIF(uid, ''), json_extract(data, '$.uid'))) LIKE ?`;
        params.push(`%${term}%`);
    }

    params.push(Math.max(1, input.limit));
    return {
        sql: `SELECT * FROM sessions
            ${SESSIONS_FOR_LOCATION_WHERE}
            ${match}
            ${SESSIONS_NEWEST_FIRST}
            LIMIT ?;`,
        params,
    };
}

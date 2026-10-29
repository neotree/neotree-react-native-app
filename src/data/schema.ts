/**
 * Schema for the tables the export pipeline reads and writes.
 *
 * Kept free of expo-sqlite so the tests can build exactly these tables in an
 * in-memory database and run the real queries against them. `db.ts` applies
 * the same statements on the device.
 */

export const SESSIONS_TABLE_COLUMNS = [
    'id integer primary key not null',
    'session_id integer',
    'script_id varchar',
    'type varchar',
    'uid varchar',
    'data text',
    'completed boolean',
    'exported boolean',
    'local_export boolean default 0',
    'poll_exported boolean default 0',
    'main_export_blocked boolean default 0',
    'poll_export_blocked boolean default 0',
    'local_export_blocked boolean default 0',
    'export_last_error text',
    'export_blocked_at datetime',
    'createdAt datetime',
    'updatedAt datetime',
];

/**
 * Columns added after the sessions table first shipped. A device can be
 * upgraded from any earlier version, so each is added only when missing.
 */
export const SESSIONS_ADDED_COLUMNS: [string, string][] = [
    ['local_export', 'BOOLEAN DEFAULT 0'],
    ['poll_exported', 'BOOLEAN DEFAULT 0'],
    ['main_export_blocked', 'BOOLEAN DEFAULT 0'],
    ['poll_export_blocked', 'BOOLEAN DEFAULT 0'],
    ['local_export_blocked', 'BOOLEAN DEFAULT 0'],
    ['export_last_error', 'TEXT'],
    // When the session was last quarantined. Rows quarantined before this
    // column existed read as NULL, which the sweep treats as long expired: those
    // are exactly the rows that were stranded, and they get one fresh attempt.
    ['export_blocked_at', 'DATETIME'],
];

export const EXPORTS_TABLE_COLUMNS = [
    'id integer primary key not null',
    'session_id integer not null',
    'uid varchar',
    'scriptid varchar',
    'data text',
    'ingested_at datetime',
];

export const SESSION_INDEX_STATEMENTS = [
    `CREATE INDEX IF NOT EXISTS sessions_main_export_pending_idx ON sessions(exported, main_export_blocked, createdAt);`,
    `CREATE INDEX IF NOT EXISTS sessions_poll_export_pending_idx ON sessions(poll_exported, poll_export_blocked, createdAt);`,
    `CREATE INDEX IF NOT EXISTS sessions_local_export_pending_idx ON sessions(local_export, local_export_blocked, createdAt);`,
    `CREATE INDEX IF NOT EXISTS sessions_location_idx
        ON sessions(json_extract(data, '$.country'), TRIM(json_extract(data, '$.hospital_id')), createdAt)
        WHERE json_valid(data);`,
    // Serves the Neotree ID prefix search, which is how IDs are typed.
    `CREATE INDEX IF NOT EXISTS sessions_uid_idx ON sessions(upper(uid));`,
];

/**
 * One row per remote session in `exports`.
 *
 * Rows were plain inserts, so a repeated sync stored the same session again.
 * Duplicates are removed (keeping the newest row) before the unique index is
 * created, because creating it over duplicates would fail.
 */
export const EXPORTS_MIGRATION_STATEMENTS = [
    `DELETE FROM exports WHERE id NOT IN (SELECT MAX(id) FROM exports GROUP BY session_id);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS exports_session_id_idx ON exports(session_id);`,
];

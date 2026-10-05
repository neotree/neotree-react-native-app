/* eslint-disable import/namespace */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import {
  EXPORTS_MIGRATION_STATEMENTS,
  EXPORTS_TABLE_COLUMNS,
  SESSION_INDEX_STATEMENTS,
  SESSIONS_TABLE_COLUMNS,
} from '../src/data/schema';
import {
  batchFoundBackendsDown,
  classifyExportError,
  isQuarantineExpired,
  parseLastIngestedResponse,
  pendingSessionFilter,
  QUARANTINE_RETRY_AFTER_MS,
  QUARANTINED_SESSION_FILTER,
  quarantineReleaseCutoff,
} from '../src/data/exportPlanning';
import {
  sessionsCursorAfter,
  sessionsPageQuery,
  sessionsUIDSearchQuery,
} from '../src/data/queryBuilders';
import { NetworkUnavailableError } from '../src/data/circuitBreaker';

const POLL_START = '2026-07-30T10:34:29.000Z';
const NOW = Date.parse('2026-10-05T12:00:00.000Z');
const HOUR = 60 * 60 * 1000;

/** An in-memory database with the device's real sessions/exports schema. */
function createDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE sessions (${SESSIONS_TABLE_COLUMNS.join(',')});`);
  db.exec(`CREATE TABLE exports (${EXPORTS_TABLE_COLUMNS.join(',')});`);
  SESSION_INDEX_STATEMENTS.forEach(statement => db.exec(statement));
  return db;
}

let nextId = 1;
function insertSession(db, overrides = {}) {
  const { data: dataOverrides, ...columns } = overrides;
  const row = {
    id: nextId++,
    uid: 'FB8E-0000001',
    exported: 0,
    poll_exported: 0,
    local_export: 0,
    main_export_blocked: 0,
    poll_export_blocked: 0,
    local_export_blocked: 0,
    export_blocked_at: null,
    createdAt: '2026-09-01T08:00:00.000Z',
    ...columns,
  };
  const data = {
    uid: row.uid,
    country: 'zw',
    hospital_id: 'HOSP1',
    started_at: row.createdAt,
    completed_at: '2026-09-01T09:00:00.000Z',
    ...dataOverrides,
  };
  db.prepare(`INSERT INTO sessions (id, uid, data, exported, poll_exported, local_export,
      main_export_blocked, poll_export_blocked, local_export_blocked, export_blocked_at, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    row.id, row.uid, JSON.stringify(data), row.exported, row.poll_exported, row.local_export,
    row.main_export_blocked, row.poll_export_blocked, row.local_export_blocked,
    row.export_blocked_at, row.createdAt,
  );
  return row.id;
}

function pendingIds(db, options) {
  const filter = pendingSessionFilter({
    pollingCountries: [],
    pollTrackingStartedAt: POLL_START,
    ...options,
  });
  return db.prepare(`SELECT id FROM sessions ${filter.sql} ORDER BY id;`)
    .all(...filter.params)
    .map(row => row.id);
}

// --- What the sweep selects ------------------------------------------------------

test('the sweep selects unexported completed sessions only', () => {
  const db = createDb();
  const owed = insertSession(db);
  insertSession(db, { exported: 1 });
  insertSession(db, { data: { completed_at: null } });
  insertSession(db, { data: { canceled_at: '2026-09-01T09:30:00.000Z' } });

  assert.deepEqual(pendingIds(db), [owed]);
});

test('without a release cutoff every quarantined session is left out', () => {
  const db = createDb();
  insertSession(db, { main_export_blocked: 1, export_blocked_at: '2026-01-01T00:00:00.000Z' });
  assert.deepEqual(pendingIds(db), []);
});

test('a quarantined session is retried once its wait is over', () => {
  const db = createDb();
  const cutoff = quarantineReleaseCutoff(NOW);
  const expired = insertSession(db, {
    main_export_blocked: 1,
    export_blocked_at: new Date(NOW - QUARANTINE_RETRY_AFTER_MS - HOUR).toISOString(),
  });
  insertSession(db, {
    main_export_blocked: 1,
    export_blocked_at: new Date(NOW - HOUR).toISOString(),
  });

  assert.deepEqual(pendingIds(db, { releaseBlockedBefore: cutoff }), [expired]);
});

test('sessions quarantined before the timestamp existed are released', () => {
  // The stranded rows: blocked, with no record of when.
  const db = createDb();
  const stranded = insertSession(db, { main_export_blocked: 1, export_blocked_at: null });
  assert.deepEqual(pendingIds(db, { releaseBlockedBefore: quarantineReleaseCutoff(NOW) }), [stranded]);
});

test('poll delivery is only owed by polling countries after tracking began', () => {
  const db = createDb();
  const owed = insertSession(db, { exported: 1, createdAt: '2026-08-15T00:00:00.000Z' });
  insertSession(db, { exported: 1, createdAt: '2026-07-01T00:00:00.000Z' });
  insertSession(db, { exported: 1, createdAt: '2026-08-15T00:00:00.000Z', data: { country: 'mw' } });

  assert.deepEqual(pendingIds(db, { pollingCountries: ['zw'] }), [owed]);
});

test('local delivery is only owed by sessions from the configured site', () => {
  const db = createDb();
  const owed = insertSession(db, { exported: 1, data: { hospital_id: ' HOSP1 ' } });
  insertSession(db, { exported: 1, data: { hospital_id: 'HOSP2' } });

  assert.deepEqual(
    pendingIds(db, { local: { country: 'zw', hospital: 'HOSP1' } }),
    [owed],
  );
});

test('the quarantined-session filter finds blocks on any destination', () => {
  const db = createDb();
  const main = insertSession(db, { main_export_blocked: 1 });
  const local = insertSession(db, { local_export_blocked: 1 });
  insertSession(db);
  insertSession(db, { poll_export_blocked: 1, data: { canceled_at: '2026-09-02T00:00:00.000Z' } });

  const ids = db.prepare(`SELECT id FROM sessions ${QUARANTINED_SESSION_FILTER} ORDER BY id;`)
    .all()
    .map(row => row.id);
  assert.deepEqual(ids, [main, local]);
});

// --- Quarantine expiry in memory ------------------------------------------------------

test('quarantine expiry matches the sweep rule', () => {
  const expiredAt = new Date(NOW - QUARANTINE_RETRY_AFTER_MS - 1).toISOString();
  const recentAt = new Date(NOW - HOUR).toISOString();

  assert.equal(isQuarantineExpired({ main_export_blocked: 1, export_blocked_at: expiredAt }, NOW), true);
  assert.equal(isQuarantineExpired({ main_export_blocked: 1, export_blocked_at: recentAt }, NOW), false);
  assert.equal(isQuarantineExpired({ poll_export_blocked: 1, export_blocked_at: null }, NOW), true);
  assert.equal(isQuarantineExpired({ export_blocked_at: expiredAt }, NOW), false, 'not quarantined at all');
});

// --- Failure classification -----------------------------------------------------------

test('network failures are retryable, configuration failures are not', () => {
  assert.deepEqual(
    classifyExportError(new NetworkUnavailableError('zw:nodeapi')),
    { kind: 'network', message: 'zw:nodeapi is currently unreachable', retryable: true },
  );
  assert.equal(classifyExportError(new Error('Network request failed')).kind, 'network');
  assert.equal(classifyExportError(new Error('Location not set')).retryable, false);
  assert.equal(classifyExportError(new Error('boom'), 'conversion').retryable, false);
  assert.equal(classifyExportError(new Error('something odd')).retryable, true);
});

test('a network error from another copy of the class is still recognised', () => {
  const foreign = Object.assign(new Error('down'), { name: 'NetworkUnavailableError' });
  assert.equal(classifyExportError(foreign).kind, 'network');
});

// --- When a large export stops early ---------------------------------------------------

test('draining stops only when nothing got through and the network is why', () => {
  const network = { kind: 'network' };
  const http = { kind: 'http' };

  assert.equal(batchFoundBackendsDown({ deliveredBefore: 5, deliveredAfter: 5, newFailures: [network, network] }), true);
  assert.equal(batchFoundBackendsDown({ deliveredBefore: 5, deliveredAfter: 6, newFailures: [network] }), false, 'some got through');
  assert.equal(batchFoundBackendsDown({ deliveredBefore: 5, deliveredAfter: 5, newFailures: [network, http] }), false, 'not purely network');
  assert.equal(batchFoundBackendsDown({ deliveredBefore: 5, deliveredAfter: 5, newFailures: [] }), false, 'nothing failed');
});

// --- Sessions exported by other devices -------------------------------------------------

test('the last-ingested response is read whether or not it is pre-parsed', () => {
  const sessions = [{ id: 1 }];
  assert.deepEqual(parseLastIngestedResponse({ sessions }), { error: null, sessions });
  assert.deepEqual(parseLastIngestedResponse(JSON.stringify({ sessions })), { error: null, sessions });
  assert.deepEqual(
    parseLastIngestedResponse(JSON.stringify(JSON.stringify({ sessions }))),
    { error: null, sessions },
    'double-encoded, as the old client assumed',
  );
});

test('a bad last-ingested response is reported instead of throwing', () => {
  assert.equal(parseLastIngestedResponse('<html>').error, 'The server returned a response that is not JSON.');
  assert.equal(parseLastIngestedResponse(null).error, 'The server returned an empty response.');
  assert.equal(parseLastIngestedResponse({ error: 'denied' }).error, 'denied');
  assert.deepEqual(parseLastIngestedResponse({ sessions: 'nope' }).sessions, []);
});

// --- The exports table ------------------------------------------------------------------

test('the exports migration keeps one row per session and enforces it', () => {
  const db = createDb();
  const insert = db.prepare('INSERT INTO exports (session_id, uid, ingested_at) VALUES (?, ?, ?)');
  insert.run(7, 'FB8E-0000001', '2026-09-01');
  insert.run(7, 'FB8E-0000001', '2026-09-02');
  insert.run(8, 'FB8E-0000002', '2026-09-02');

  EXPORTS_MIGRATION_STATEMENTS.forEach(statement => db.exec(statement));
  assert.deepEqual(
    db.prepare('SELECT session_id, ingested_at FROM exports ORDER BY session_id').all()
      .map(row => ({ ...row })),
    [{ session_id: 7, ingested_at: '2026-09-02' }, { session_id: 8, ingested_at: '2026-09-02' }],
  );

  db.prepare(`INSERT OR REPLACE INTO exports (session_id, uid, ingested_at) VALUES (?, ?, ?)`)
    .run(7, 'FB8E-0000001', '2026-09-03');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM exports WHERE session_id = 7').get().n, 1);
});

test('the exports migration is safe to run again', () => {
  const db = createDb();
  EXPORTS_MIGRATION_STATEMENTS.forEach(statement => db.exec(statement));
  EXPORTS_MIGRATION_STATEMENTS.forEach(statement => db.exec(statement));
});

// --- Session history paging ---------------------------------------------------------------

function readAllPages(db, pageSize, between) {
  const seen = [];
  let cursor = null;
  for (let guard = 0; guard < 100; guard += 1) {
    const query = sessionsPageQuery({ country: 'zw', hospital: 'HOSP1', limit: pageSize, cursor });
    const rows = db.prepare(query.sql).all(...query.params);
    const page = rows.slice(0, pageSize);
    seen.push(...page.map(row => row.id));
    if (rows.length <= pageSize) return seen;
    cursor = sessionsCursorAfter(page[page.length - 1]);
    between?.(seen);
  }
  throw new Error('paging did not terminate');
}

test('paging visits every session exactly once, newest first', () => {
  const db = createDb();
  const tie = '2026-09-02T00:00:00.000Z';
  const ids = [
    insertSession(db, { createdAt: '2026-09-01T00:00:00.000Z' }),
    insertSession(db, { createdAt: tie }),
    insertSession(db, { createdAt: tie }),
    insertSession(db, { createdAt: tie }),
    insertSession(db, { createdAt: '2026-09-03T00:00:00.000Z' }),
    insertSession(db, { createdAt: null }),
    insertSession(db, { createdAt: null }),
  ];

  const seen = readAllPages(db, 2);
  assert.equal(new Set(seen).size, seen.length, 'no session shown twice');
  assert.deepEqual([...seen].sort((a, b) => a - b), ids, 'every session shown');
  assert.deepEqual(seen.slice(0, 1), [ids[4]], 'newest first');
  assert.deepEqual(seen.slice(-2), [ids[6], ids[5]], 'sessions without a date come last');
});

test('deleting a shown session between pages does not skip the next one', () => {
  // The case OFFSET gets wrong: removing a row already shown would shift the
  // next page forward by one, and one session would never appear.
  const db = createDb();
  const ids = [];
  for (let day = 1; day <= 6; day += 1) {
    ids.push(insertSession(db, { createdAt: `2026-09-0${day}T00:00:00.000Z` }));
  }

  let deleted = false;
  const seen = readAllPages(db, 2, shown => {
    if (deleted) return;
    db.prepare('DELETE FROM sessions WHERE id = ?').run(shown[0]);
    deleted = true;
  });

  assert.deepEqual([...seen].sort((a, b) => a - b), ids);
});

test('paging is scoped to the site', () => {
  const db = createDb();
  const mine = insertSession(db);
  insertSession(db, { data: { hospital_id: 'HOSP2' } });
  assert.deepEqual(readAllPages(db, 10), [mine]);
});

// --- Neotree ID search ------------------------------------------------------------------

function search(db, term, mode) {
  const query = sessionsUIDSearchQuery({ country: 'zw', hospital: 'HOSP1', term, limit: 50, mode });
  return db.prepare(query.sql).all(...query.params).map(row => row.id);
}

test('prefix search matches ids starting with the term, in any case', () => {
  const db = createDb();
  const a = insertSession(db, { uid: 'FB8E-1230042' });
  const b = insertSession(db, { uid: 'fb8e-1230099' });
  insertSession(db, { uid: 'AA11-1230042' });

  assert.deepEqual(search(db, 'fb8e-123', 'prefix').sort(), [a, b].sort());
});

test('prefix search is an index range scan, not a table scan', () => {
  // Enough rows at the same site that the planner has a real choice to make.
  const db = createDb();
  for (let i = 0; i < 500; i += 1) insertSession(db, { uid: `AB${i}-0000001` });
  db.exec('ANALYZE');

  const query = sessionsUIDSearchQuery({ country: 'zw', hospital: 'HOSP1', term: 'FB8E', limit: 50, mode: 'prefix' });
  const plan = db.prepare(`EXPLAIN QUERY PLAN ${query.sql}`).all(...query.params)
    .map(row => row.detail).join(' | ');
  assert.match(plan, /SEARCH sessions USING INDEX sessions_uid_idx/);
});

test('substring search finds ids held only inside data by older rows', () => {
  const db = createDb();
  const legacy = insertSession(db, { uid: '', data: { uid: 'FB8E-7770001' } });
  assert.deepEqual(search(db, '7770001', 'substring'), [legacy]);
  assert.deepEqual(search(db, '7770001', 'prefix'), [], 'which prefix search alone would miss');
});

test('LIKE wildcards in the term are not treated as wildcards', () => {
  const db = createDb();
  insertSession(db, { uid: 'FB8E-1230042' });
  assert.deepEqual(search(db, '%', 'substring').length, 1, 'stripped, so it matches like an empty term');
  assert.deepEqual(search(db, '_B8E', 'prefix'), []);
});

/* eslint-disable import/namespace */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  exportAcknowledged,
  isLegacyPollSession,
  pollDeliverySatisfied,
  retryableHttpStatus,
} from '../src/data/deliveryRules.ts';
import {
  dateRangeError,
  filterSessionsByDateRange,
} from '../src/utils/sessionDateRange.ts';

const completed = (overrides = {}) => ({
  exported: 1,
  poll_exported: 0,
  createdAt: '2025-12-03T09:52:00.000Z',
  data: {
    country: 'zw',
    completed_at: '2025-12-03T10:29:00.000Z',
  },
  ...overrides,
});

test('pre-tracking cloud exports are legacy-delivered instead of replayed', () => {
  const session = completed();
  assert.equal(isLegacyPollSession(session), true);
  assert.equal(pollDeliverySatisfied(session, true), true);
});

test('legacy detection falls back to the session start when createdAt is corrupt', () => {
  const session = completed({
    createdAt: 'not-a-date',
    data: {
      country: 'zw',
      started_at: '2025-12-03T09:52:00.000Z',
      completed_at: '2025-12-03T10:29:00.000Z',
    },
  });
  assert.equal(isLegacyPollSession(session), true);
});

test('post-tracking poll failures remain pending and protected', () => {
  const session = completed({ createdAt: '2026-08-01T09:52:00.000Z' });
  assert.equal(isLegacyPollSession(session), false);
  assert.equal(pollDeliverySatisfied(session, true), false);
});

test('unexported legacy sessions are never considered poll-delivered by age alone', () => {
  const session = completed({ exported: 0 });
  assert.equal(isLegacyPollSession(session), false);
  assert.equal(pollDeliverySatisfied(session, true), false);
});

test('countries without explicit polling do not acquire poll debt', () => {
  assert.equal(pollDeliverySatisfied(completed({ poll_exported: 0 }), false), true);
});

test('all successful HTTP responses and duplicate acknowledgements are accepted', () => {
  [200, 201, 202, 204, 409].forEach(status => assert.equal(exportAcknowledged(status), true));
  [0, 400, 404, 500].forEach(status => assert.equal(exportAcknowledged(status), false));
});

test('only transient HTTP statuses are automatically retried', () => {
  [408, 425, 429, 500, 503].forEach(status => assert.equal(retryableHttpStatus(status), true));
  [400, 401, 403, 404, 422].forEach(status => assert.equal(retryableHttpStatus(status), false));
});

test('completion-date export ranges use completion rather than creation date', () => {
  const sessions = [
    completed({
      id: 1,
      data: { started_at: '2025-11-30T23:50:00', completed_at: '2025-12-01T00:10:00' },
    }),
    completed({
      id: 2,
      data: { started_at: '2025-12-01T23:50:00', completed_at: '2025-12-02T00:10:00' },
    }),
  ];
  const result = filterSessionsByDateRange(sessions, {
    minDate: '2025-12-01T00:00:00',
    maxDate: '2025-12-01T00:00:00',
    dateField: 'completed',
  });
  assert.deepEqual(result.map(session => session.id), [1]);
});

test('range boundaries include the entire selected days', () => {
  const sessions = [
    { id: 1, data: { started_at: '2025-12-01T00:00:00' } },
    { id: 2, data: { started_at: '2025-12-01T23:59:59' } },
    { id: 3, data: { started_at: '2025-12-02T00:00:00' } },
  ];
  const result = filterSessionsByDateRange(sessions, {
    minDate: '2025-12-01T12:00:00',
    maxDate: '2025-12-01T12:00:00',
  });
  assert.deepEqual(result.map(session => session.id), [1, 2]);
});

test('reversed date ranges are rejected instead of silently exporting nothing', () => {
  assert.equal(
    dateRangeError('2025-12-03T00:00:00', '2025-12-01T00:00:00'),
    'The start date must be on or before the end date.'
  );
  assert.throws(
    () => filterSessionsByDateRange([], {
      minDate: '2025-12-03T00:00:00',
      maxDate: '2025-12-01T00:00:00',
    }),
    /start date must be on or before/
  );
});

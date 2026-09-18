/* eslint-disable import/namespace */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildOrder,
  buildWhere,
  withParsedData,
} from '../src/data/queryBuilders.ts';

test('multiple conditions are ANDed, not comma-joined', () => {
  const { sql, params } = buildWhere({ uid: 'NT-1', script_id: 'abc' });
  assert.equal(sql, ' where uid=? and script_id=?');
  assert.deepEqual(params, ['NT-1', 'abc']);
});

test('values are bound rather than inlined, so quotes survive', () => {
  const { sql, params } = buildWhere({ uid: "O'Brien" });
  assert.equal(sql, ' where uid=?');
  assert.deepEqual(params, ["O'Brien"]);
});

test('an empty filter produces no clause and no params', () => {
  assert.deepEqual(buildWhere(), { sql: '', params: [] });
  assert.deepEqual(buildWhere({}), { sql: '', params: [] });
});

test('non-identifier column names are rejected instead of interpolated', () => {
  assert.throws(
    () => buildWhere({ 'uid = 1 or 1': 'x' }),
    /Invalid column name/,
  );
});

test('order clauses are emitted for valid columns and directions', () => {
  assert.equal(buildOrder([['createdAt', 'DESC']]), ' order by createdAt DESC');
  assert.equal(buildOrder([['position', 'asc']]), ' order by position ASC');
});

test('the fallback order is used only when none is supplied', () => {
  assert.equal(buildOrder(undefined, [['position', 'ASC']]), ' order by position ASC');
  assert.equal(buildOrder([['createdAt', 'DESC']], [['position', 'ASC']]), ' order by createdAt DESC');
  assert.equal(buildOrder(undefined), '');
});

test('unsafe order columns and unknown directions are dropped', () => {
  assert.equal(buildOrder([['createdAt; drop table sessions', 'DESC']]), '');
  assert.equal(buildOrder([['createdAt', 'sideways']]), ' order by createdAt');
});

test('rows without data parse to an empty object instead of throwing', () => {
  assert.deepEqual(
    withParsedData([{ id: 1, data: '{"uid":"NT-1"}' }, { id: 2, data: null }]),
    [{ id: 1, data: { uid: 'NT-1' } }, { id: 2, data: {} }],
  );
  assert.deepEqual(withParsedData(), []);
});

/* eslint-disable import/namespace */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatNeotreeIDInput,
  NEOTREE_ID_MAX_LENGTH,
} from '../src/utils/neotreeId';

test('the separator is appended as soon as the prefix is complete', () => {
  assert.equal(formatNeotreeIDInput('FB8E', 'FB8'), 'FB8E-');
});

test('no separator is appended while the prefix is still incomplete', () => {
  assert.equal(formatNeotreeIDInput('FB8', 'FB'), 'FB8');
  assert.equal(formatNeotreeIDInput('', ''), '');
});

test('typing the suffix keeps the separator in place', () => {
  assert.equal(formatNeotreeIDInput('FB8E-1', 'FB8E-'), 'FB8E-1');
  assert.equal(formatNeotreeIDInput('FB8E-1230042', 'FB8E-123004'), 'FB8E-1230042');
});

test('input is upper-cased so it matches how ids are stored', () => {
  assert.equal(formatNeotreeIDInput('fb8e', 'fb8'), 'FB8E-');
  assert.equal(formatNeotreeIDInput('fb8e-123', 'fb8e-12'), 'FB8E-123');
});

test('a separator the user types themselves is not duplicated', () => {
  assert.equal(formatNeotreeIDInput('FB8E-', 'FB8E-'), 'FB8E-');
  assert.equal(formatNeotreeIDInput('FB-8E', 'FB-8'), 'FB8E-');
});

test('a pasted id is reformatted rather than rejected', () => {
  assert.equal(formatNeotreeIDInput('fb8e 123 0042', ''), 'FB8E-1230042');
  assert.equal(formatNeotreeIDInput('FB8E--1230042', ''), 'FB8E-1230042');
});

test('backspacing steps out of the suffix before removing the separator', () => {
  // 'FB8E-1' -> backspace leaves the separator, so the next one removes it.
  assert.equal(formatNeotreeIDInput('FB8E-', 'FB8E-1'), 'FB8E-');
  assert.equal(formatNeotreeIDInput('FB8E', 'FB8E-'), 'FB8E');
  assert.equal(formatNeotreeIDInput('FB8', 'FB8E'), 'FB8');
});

test('the value never exceeds what the field allows', () => {
  const formatted = formatNeotreeIDInput('FB8E12300429999', '');
  assert.equal(formatted, 'FB8E-1230042');
  assert.equal(formatted.length, NEOTREE_ID_MAX_LENGTH);
});

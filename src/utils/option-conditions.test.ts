/**
 * Option-level conditions, focused on `$self`.
 *
 *   node --experimental-strip-types src/utils/option-conditions.test.ts
 */
import assert from 'node:assert/strict';

import { collectOptionConditionKeys, getVisibleFieldItems } from './option-conditions';

let passed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
    try { fn(); passed++; } catch (error: any) {
        failures.push(`${name}\n    ${error?.message?.split('\n')[0] || error}`);
    }
}

const field = (key: string, items: any[]) => ({ key, items });

test('$self is rewritten to the field own key before evaluation', () => {
    const seen: string[] = [];
    getVisibleFieldItems(
        field('Outcome', [{ value: 'A', condition: `$self != 'B'` }]),
        c => { seen.push(c); return true; },
    );
    assert.deepEqual(seen, [`$Outcome != 'B'`]);
});

test('$self is matched case-insensitively and only as a whole token', () => {
    const seen: string[] = [];
    getVisibleFieldItems(
        field('Outcome', [{ value: 'A', condition: `$SELF = 'x' and $selfish = 'y'` }]),
        c => { seen.push(c); return true; },
    );
    assert.deepEqual(seen, [`$Outcome = 'x' and $selfish = 'y'`]);
});

test('conditions without $self are passed through unchanged', () => {
    const seen: string[] = [];
    const condition = `$Other = 'B'`;
    getVisibleFieldItems(field('Outcome', [{ value: 'A', condition }]), c => { seen.push(c); return true; });
    assert.deepEqual(seen, [condition]);
});

test('$self resolves to the field key in the dependency list', () => {
    // Without this the memo signature misses the field's own value, so options
    // would never re-filter when the clinician changes that very field.
    const keys = collectOptionConditionKeys(field('Outcome', [{ value: 'A', condition: `$self != 'B'` }]));
    assert.deepEqual(keys, ['outcome']);
});

test('a field with no key leaves $self alone rather than producing "$"', () => {
    const seen: string[] = [];
    getVisibleFieldItems(
        { key: '', items: [{ value: 'A', condition: `$self = 'x'` }] },
        c => { seen.push(c); return true; },
    );
    assert.deepEqual(seen, [`$self = 'x'`]);
});

test('a false condition hides the option, a true one keeps it', () => {
    const f = field('Outcome', [
        { value: 'A', condition: `$self = 'A'` },
        { value: 'B' },
    ]);
    const visible = getVisibleFieldItems(f, c => c.includes(`'A'`));
    assert.deepEqual(visible.map((i: any) => i.value), ['A', 'B']);
    const hidden = getVisibleFieldItems(f, () => false);
    assert.deepEqual(hidden.map((i: any) => i.value), ['B']);
});

if (failures.length) {
    console.error(`\n${failures.length} failed, ${passed} passed\n`);
    failures.forEach(f => console.error(`  ✗ ${f}`));
    process.exit(1);
}
console.log(`\n  ${passed} passed\n`);

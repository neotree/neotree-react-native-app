// Run: npx tsx scripts/tests/calculated-field.test.ts   (no test framework in this repo)
import assert from 'assert';
import { isCalculatedDateField, isCalculatedNumberField } from '../../src/utils/calculated-field';

// Numbers: any calculation locks the field
assert.equal(isCalculatedNumberField({ calculation: 'MATH($Weight / Math.pow(($Height / 100), 2))' }), true);
assert.equal(isCalculatedNumberField({ calculation: 'SUM($a, $b)' }), true);
assert.equal(isCalculatedNumberField({ calculation: '$Weight' }), true, 'a single key is a calculation too');
assert.equal(isCalculatedNumberField({ calculation: '  MATH($a + 1)  ' }), true);
// ...and no calculation leaves it editable
for (const f of [{}, { calculation: '' }, { calculation: '   ' }, { calculation: null }, { calculation: undefined }, null, undefined]) {
    assert.equal(isCalculatedNumberField(f as any), false, `editable: ${JSON.stringify(f)}`);
}

// Dates: a date calculation locks it
assert.equal(isCalculatedDateField({ calculation: "DATE_ADD($LMPDate, 280, 'days')" }), true);
assert.equal(isCalculatedDateField({ calculation: "DATE_FIRST(DATE_ADD($A, 280, 'days'), DATE_ADD($B, 7, 'days'))" }), true);
assert.equal(isCalculatedDateField({ calculation: "  DATE_ADD($LMPDate, 280, 'days')" }), true);
// A calculation that isn't a date one produces no value for a date field, so the field stays editable
assert.equal(isCalculatedDateField({ calculation: 'MATH($a + 1)' }), false);
for (const f of [{}, { calculation: '' }, { calculation: ' ' }, { calculation: null }, null, undefined]) {
    assert.equal(isCalculatedDateField(f as any), false, `editable: ${JSON.stringify(f)}`);
}

console.log('calculated-field tests passed');

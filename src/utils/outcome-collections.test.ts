/**
 * $Diagnoses / $Problems outcome collections.
 *
 *   node --experimental-strip-types src/utils/outcome-collections.test.ts
 */
import assert from 'node:assert/strict';

import { buildOutcomeEntries, referencesOutcomeCollection } from './outcome-collections';

let passed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
    try { fn(); passed++; } catch (error: any) {
        failures.push(`${name}\n    ${error?.message?.split('\n')[0] || error}`);
    }
}

/** An entry as the diagnosis screen commits it. */
const dxScreen = (...dx: { key: string; how_agree?: string; value?: string }[]) => ({
    screen: { id: 's1', type: 'diagnosis' },
    values: dx.map(d => ({
        key: d.key,
        value: d.value ?? d.key,
        type: 'diagnosis',
        dataType: 'diagnosis',
        diagnosis: { how_agree: d.how_agree ?? null },
    })),
});

const problemScreen = (...p: { key: string; how_agree?: string }[]) => ({
    screen: { id: 's2', type: 'problems' },
    values: p.map(x => ({
        key: x.key,
        value: x.key,
        problem: { how_agree: x.how_agree ?? null },
    })),
});

const valuesFor = (entries: any[], key: string) =>
    entries.flatMap(e => e.values).filter((v: any) => v.key === key).map((v: any) => v.value);

// ---------------------------------------------------------------- the probe

test('probe matches both keys, case-insensitively', () => {
    assert.equal(referencesOutcomeCollection(`$Diagnoses = 'RDN'`), true);
    assert.equal(referencesOutcomeCollection(`$problems = 'Yell'`), true);
    assert.equal(referencesOutcomeCollection(`$DIAGNOSES = 'x'`), true);
});

test('probe does not match similar keys', () => {
    assert.equal(referencesOutcomeCollection(`$DiagnosesOther = 'x'`), false);
    assert.equal(referencesOutcomeCollection(`$Diagnosis = 'x'`), false);
    assert.equal(referencesOutcomeCollection(`$Sex = 'M'`), false);
});

test('probe is stateless across repeated calls', () => {
    const e = `$Diagnoses = 'RDN'`;
    assert.equal(referencesOutcomeCollection(e), true);
    assert.equal(referencesOutcomeCollection(e), true);
});

// ------------------------------------------------------------- collection

test('confirmed diagnoses answer under $Diagnoses', () => {
    const out = buildOutcomeEntries([dxScreen({ key: 'RDN' }, { key: 'PREMRDS' })]);
    assert.deepEqual(valuesFor(out, 'Diagnoses'), ['RDN', 'PREMRDS']);
});

test('a rejected diagnosis is excluded', () => {
    // The clinician disagreed; it stays in the entry but is not a diagnosis.
    const out = buildOutcomeEntries([dxScreen({ key: 'RDN' }, { key: 'SEPSIS', how_agree: 'No' })]);
    assert.deepEqual(valuesFor(out, 'Diagnoses'), ['RDN']);
});

test('how_agree values other than No still count', () => {
    const out = buildOutcomeEntries([dxScreen({ key: 'RDN', how_agree: 'Yes' }, { key: 'X', how_agree: 'Maybe' })]);
    assert.deepEqual(valuesFor(out, 'Diagnoses'), ['RDN', 'X']);
});

test('problems answer under $Problems and are filtered the same way', () => {
    const out = buildOutcomeEntries([problemScreen({ key: 'Yell' }, { key: 'Cold', how_agree: 'No' })]);
    assert.deepEqual(valuesFor(out, 'Problems'), ['Yell']);
});

test('both collections coexist', () => {
    const out = buildOutcomeEntries([dxScreen({ key: 'RDN' }), problemScreen({ key: 'Yell' })]);
    assert.deepEqual(valuesFor(out, 'Diagnoses'), ['RDN']);
    assert.deepEqual(valuesFor(out, 'Problems'), ['Yell']);
});

test('outcomes are emitted as a multi_select shape', () => {
    // This is what makes `$Diagnoses = 'RDN'` match any one of several.
    const out = buildOutcomeEntries([dxScreen({ key: 'RDN' }, { key: 'PREMRDS' })]);
    assert.equal(out.length, 1);
    assert.equal(out[0].screen.type, 'multi_select');
});

// ------------------------------------------------------------- edge cases

test('no outcome screens yields nothing', () => {
    assert.deepEqual(buildOutcomeEntries([{ screen: { id: 'x', type: 'form' }, values: [{ key: 'A', value: '1' }] }]), []);
    assert.deepEqual(buildOutcomeEntries([]), []);
    assert.deepEqual(buildOutcomeEntries(null as any), []);
});

test('an outcome screen with every suggestion rejected yields nothing', () => {
    // Nothing confirmed, so $Diagnoses stays unresolved and `= 'RDN'` is false.
    assert.deepEqual(buildOutcomeEntries([dxScreen({ key: 'RDN', how_agree: 'No' })]), []);
});

test('blank and missing names are skipped', () => {
    const entry = { screen: { id: 's', type: 'diagnosis' }, values: [
        { key: '   ', value: '  ' },
        { key: null, value: null },
        { key: 'RDN', value: 'RDN' },
    ] };
    assert.deepEqual(valuesFor(buildOutcomeEntries([entry]), 'Diagnoses'), ['RDN']);
});

test('screen type matching is case-insensitive', () => {
    const entry = { screen: { id: 's', type: 'DIAGNOSIS' }, values: [{ key: 'RDN', value: 'RDN' }] };
    assert.deepEqual(valuesFor(buildOutcomeEntries([entry]), 'Diagnoses'), ['RDN']);
});

test('entries exposing values as `value` are read too', () => {
    const entry = { screen: { id: 's', type: 'diagnosis' }, value: [{ key: 'RDN', value: 'RDN' }] };
    assert.deepEqual(valuesFor(buildOutcomeEntries([entry]), 'Diagnoses'), ['RDN']);
});

test('the empty result is shared, so the common case allocates nothing', () => {
    assert.equal(buildOutcomeEntries([]), buildOutcomeEntries([{ screen: { type: 'form' }, values: [] }]));
});

if (failures.length) {
    console.error(`\n${failures.length} failed, ${passed} passed\n`);
    failures.forEach(f => console.error(`  ✗ ${f}`));
    process.exit(1);
}
console.log(`\n  ${passed} passed\n`);

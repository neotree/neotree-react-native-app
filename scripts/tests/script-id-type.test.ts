// Run: npx tsx scripts/tests/script-id-type.test.ts   (no test framework in this repo)
import assert from 'assert';
import { getScriptIdType } from '../../src/utils/script-id-type';
import { buildUid } from '../../src/utils/uid-counter';
import { formatNeotreeIDInput, looksLikeMuid, normaliseUidSearch, NEOTREE_ID_MAX_LENGTH } from '../../src/utils/neotreeId';
import { isValidMuid } from '../../src/utils/muid';
import { validateUID } from '../../src/utils/uid-validate';
import { checkScannedUid } from '../../src/utils/scanned-uid';

// A script's type comes from its data; anything else is a NUID script
assert.equal(getScriptIdType({ data: { idType: 'muid' } }), 'muid');
assert.equal(getScriptIdType({ data: { idType: 'nuid' } }), 'nuid');
for (const s of [undefined, null, {}, { data: {} }, { data: { idType: 'MUID' } }, { data: { idType: 5 } }]) assert.equal(getScriptIdType(s as any), 'nuid');

// Building IDs: NUIDs are exactly as before; MUIDs are valid and unique per counter
assert.equal(buildUid({ prefix: 'FB8E', counter: 42, extraDigits: '123' }), 'FB8E-1230042');
assert.equal(buildUid({ prefix: 'FB8E', counter: 42, idType: 'nuid', extraDigits: '123' }), 'FB8E-1230042');
assert.equal(buildUid({ prefix: 'FB8E', counter: 10001, extraDigits: '123' }), 'FB8E-1230001', 'NUID counter still wraps at 4 digits (unchanged)');
assert.equal(buildUid({ prefix: '0K7Q', counter: 1, idType: 'muid' }), 'M0K7Q-000001R');
assert.ok(validateUID(buildUid({ prefix: 'FB8E', counter: 7, extraDigits: '999' })).isValid, 'a built NUID passes the NUID check');
{
    const seen = new Set<string>();
    for (let n = 1; n <= 12000; n++) { const id = buildUid({ prefix: '1A2B', counter: n, idType: 'muid' }); assert.ok(isValidMuid(id)); seen.add(id); }
    assert.equal(seen.size, 12000, 'MUIDs do not repeat past 9999 sessions');
}
assert.throws(() => buildUid({ prefix: '', counter: 1 }), /prefix/);
assert.throws(() => buildUid({ prefix: '   ', counter: 1, idType: 'muid' }), /prefix/);
assert.throws(() => buildUid({ prefix: 'ZZ', counter: 1, idType: 'muid' }), /tablet ID/);
assert.throws(() => buildUid({ prefix: 'FB8U', counter: 1, idType: 'muid' }), /tablet ID/, 'U is not a MUID character');

// Typing: the field follows whichever format is being typed
assert.equal(formatNeotreeIDInput('fb8e1230042'), 'FB8E-1230042');
assert.equal(formatNeotreeIDInput('fb8e'), 'FB8E-');
assert.equal(formatNeotreeIDInput('m0k7q000001r'), 'M0K7Q-000001R');
assert.equal(formatNeotreeIDInput('M0K7Q'), 'M0K7Q-', 'hyphen goes in after the tablet part');
assert.equal(formatNeotreeIDInput('MOK7Q-0'), 'M0K7Q-0', 'O typed for 0');
assert.equal(looksLikeMuid('m0k7'), true);
assert.equal(looksLikeMuid('FB8E-1'), false, 'NUID prefixes are hex, never M');
assert.equal(NEOTREE_ID_MAX_LENGTH, 13);

// Searching: a MUID is searched in its stored form, however it was typed
assert.equal(normaliseUidSearch('M0K7Q-000001R'), 'M0K7Q-000001R');
assert.equal(normaliseUidSearch('m0k7q000001r'), 'M0K7Q-000001R', 'typed without the hyphen');
assert.equal(normaliseUidSearch('m0k7q-0'), 'M0K7Q-0', 'partial MUIDs search as typed');
assert.equal(normaliseUidSearch('M0K7Q-'), 'M0K7Q', 'half-typed: trailing hyphen dropped');
assert.equal(normaliseUidSearch('FB8E-1230042'), 'FB8E-1230042');
assert.equal(normaliseUidSearch('FB8E-'), 'FB8E', 'half-typed NUID loses its trailing dash, as before');
assert.equal(normaliseUidSearch('  '), '');

console.log('script-id-type tests passed');

// ---- Scanning: the script's ID type decides what a QR code must hold ----
{
    const ok = (r: any) => r.ok === true;
    // MUID script: only valid MUIDs
    assert.deepEqual(checkScannedUid('M0K7Q-000001R', 'muid'), { ok: true, uid: 'M0K7Q-000001R' });
    assert.deepEqual(checkScannedUid('m0k7q000001r', 'muid'), { ok: true, uid: 'M0K7Q-000001R' }, 'a missing hyphen and case are put right');
    assert.deepEqual(checkScannedUid('M0K7-Q000-001R', 'muid'), { ok: true, uid: 'M0K7Q-000001R' }, 'the old grouping is accepted and stored properly');
    assert.deepEqual(checkScannedUid(' MOK7Q-000001R ', 'muid'), { ok: true, uid: 'M0K7Q-000001R' }, 'O read as 0');
    let r = checkScannedUid('FB8E-1230042', 'muid');
    assert.ok(!ok(r) && /NUID/.test(r.message) && /MUID/.test(r.message), 'a NUID is explained, not silently accepted');
    r = checkScannedUid('M0K7Q000002R', 'muid');
    assert.ok(!ok(r) && /mistyped|doesn't match/i.test(r.message), 'bad check character');
    r = checkScannedUid('hello', 'muid');
    assert.ok(!ok(r) && /valid MUID/.test(r.message));
    assert.ok(!ok(checkScannedUid('', 'muid')) && !ok(checkScannedUid(null, 'muid')) && !ok(checkScannedUid(undefined, 'nuid')));
    // NUID script: unchanged, except a MUID is refused
    assert.deepEqual(checkScannedUid('FB8E-1230042', 'nuid'), { ok: true, uid: 'FB8E-1230042' });
    assert.deepEqual(checkScannedUid('FB8E-1230042'), { ok: true, uid: 'FB8E-1230042' }, 'default is nuid');
    assert.deepEqual(checkScannedUid('AB12-123', 'nuid'), { ok: true, uid: 'AB12-123' }, 'older codes are not newly rejected');
    r = checkScannedUid('M0K7Q000001R', 'nuid');
    assert.ok(!ok(r) && /MUID/.test(r.message) && /NUID/.test(r.message));
    // Any (barcode printing)
    assert.deepEqual(checkScannedUid('M0K7Q000001R', 'any'), { ok: true, uid: 'M0K7Q-000001R' });
    assert.deepEqual(checkScannedUid('FB8E-1230042', 'any'), { ok: true, uid: 'FB8E-1230042' });
    console.log('scan checks passed');
}

// validateUID must not throw on text without a dash (a scanned value can be anything)
assert.equal(validateUID('M0K7Q-000001R').isValid, false, 'a MUID is not a NUID');
assert.equal(validateUID('M0K7Q000001R').isValid, false);
assert.equal(validateUID('').isValid, false);
assert.equal(validateUID('FB8E').isValid, false);
assert.equal(validateUID('FB8E-1230042').isValid, true);

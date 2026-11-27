// Run: npx tsx scripts/tests/session-uid.test.ts   (no test framework in this repo)
import assert from 'assert';
import { pickSessionUid } from '../../src/utils/session-uid';

const M = 'M0K7Q-000001R';
const N = 'FB8E-1230042';
const pick = (o: any) => pickSessionUid({ idType: 'muid', ...o });

// MUID script: a MUID candidate is picked, in its stored form
assert.equal(pick({ entryUid: M, generatedUid: 'M1A2B-000009Z' }), M);
assert.equal(pick({ entryUid: 'm0k7q000001r' }), M, 'hyphen-free / lower case is stored properly');
assert.equal(pick({ searchedUid: M, entryUid: 'M1A2B-00000AJ' }), M, 'the searched ID wins, as before');
// ...an NUID is not: the next candidate, then the generated MUID, is used
assert.equal(pick({ searchedUid: N, entryUid: M }), M, 'skips an NUID candidate and takes the next one');
assert.equal(pick({ entryUid: N, generatedUid: M }), M, 'a stale NUID never becomes the session ID');
assert.equal(pick({ searchedUid: 'M0K7Q-000002R', generatedUid: M }), M, 'a mistyped MUID (bad check character) is not used');
assert.equal(pick({ generatedUid: M }), M);
// Resuming: the session keeps the ID it was saved with, even if the script has since switched to MUID
assert.equal(pick({ existingUid: N, entryUid: N, generatedUid: M }), N);
assert.equal(pick({ existingUid: N, generatedUid: M }), N);
assert.equal(pick({ existingUid: N, entryUid: M }), M, 'a valid MUID candidate still wins over an old NUID');

// NUID script: exactly the old behaviour, except a MUID is not taken
const nuid = (o: any) => pickSessionUid({ idType: 'nuid', ...o });
assert.equal(nuid({ entryUid: N, generatedUid: 'AAAA-1110001' }), N);
assert.equal(nuid({ searchedUid: N, entryUid: 'AB12-0000001' }), N);
assert.equal(nuid({ entryUid: 'AB12-123' }), 'AB12-123', 'older NUIDs are not newly rejected');
assert.equal(nuid({ generatedUid: 'AAAA-1110001' }), 'AAAA-1110001');
assert.equal(nuid({ entryUid: M, generatedUid: N }), N, 'a MUID is not taken for a NUID script');
assert.equal(nuid({ existingUid: M, entryUid: M, generatedUid: N }), M, 'a resumed session keeps its ID');

// Scripts that need the searched ID
assert.throws(() => pick({ requiresSearchedUid: true }), /requires the searched Neotree ID/);
assert.throws(() => pick({ requiresSearchedUid: true, searchedUid: N }), /uses MUIDs.*FB8E-1230042.*not a MUID/);
assert.throws(() => nuid({ requiresSearchedUid: true, searchedUid: M }), /uses NUIDs.*not a NUID/);
assert.equal(pick({ requiresSearchedUid: true, searchedUid: M }), M);
assert.equal(pick({ requiresSearchedUid: true, existingUid: N }), N, 'resuming does not need the search again');
assert.equal(pick({ requiresSearchedUid: true, generatedUid: M, entryUid: M }), M);
assert.equal(pick({ requiresSearchedUid: false }), '', 'nothing at all gives an empty ID, as before');

console.log('session-uid tests passed');

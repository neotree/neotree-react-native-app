// Run: npx tsx scripts/tests/review-configurations.test.ts   (no test framework in this repo)
import assert from 'assert';
import { keepExistingScreens } from '../../src/utils/review-configurations';

const screens = [{ screen_id: 'a' }, { screen_id: 'b' }, { screen_id: 'c' }];
const entries = [
    { label: 'Demographics', screen: 'a' },
    { label: 'Gone', screen: 'deleted-screen' },
    { label: 'Vitals', screen: 'c' },
    { label: 'Not chosen', screen: '' },
];

// A screen deleted in the editor is no longer listed on the review page
assert.deepEqual(keepExistingScreens(entries, screens).map(e => e.label), ['Demographics', 'Vitals', 'Not chosen']);
// Nothing stale: unchanged
assert.deepEqual(keepExistingScreens(entries.slice(0, 1), screens), entries.slice(0, 1));
// Every screen gone: an empty list, so the review page doesn't appear at all
assert.deepEqual(keepExistingScreens([{ label: 'x', screen: 'zzz' }], screens), []);
assert.deepEqual(keepExistingScreens(entries, []), [{ label: 'Not chosen', screen: '' }], 'a script with no screens keeps only unfinished entries');
assert.deepEqual(keepExistingScreens(entries, null), [{ label: 'Not chosen', screen: '' }]);
// Whatever an older sync left in the field
assert.deepEqual(keepExistingScreens(undefined, screens), []);
assert.deepEqual(keepExistingScreens(null, screens), []);
assert.deepEqual(keepExistingScreens('nonsense', screens), []);
assert.deepEqual(keepExistingScreens(JSON.stringify(entries), screens).map(e => e.label), ['Demographics', 'Vitals', 'Not chosen'], 'a list stored as JSON text');
assert.deepEqual(keepExistingScreens([{ label: 'n', screen: 5 as any }], [{ screen_id: 5 as any }]).length, 1, 'ids compared as text');

console.log('review-configurations tests passed');

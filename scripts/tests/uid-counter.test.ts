// Run: npx tsx scripts/tests/uid-counter.test.ts   (no test framework in this repo)
import assert from 'assert';
import { resolveSessionCounter, resolveUidPrefix, shouldReportCounter } from '../../src/utils/uid-counter';

// Counter at or ahead of the editor's: left alone
assert.equal(resolveSessionCounter({ local: 120, serverCount: 120, serverFloor: 620 }), 120);
assert.equal(resolveSessionCounter({ local: 130, serverCount: 120, serverFloor: 620 }), 130);
assert.equal(resolveSessionCounter({ local: 0, serverCount: 0, serverFloor: 0 }), 0, 'new tablet starts at the beginning');

// Reinstall / "clear data": counter back to 0 while the editor has seen 120 -> resume past it
assert.equal(resolveSessionCounter({ local: 0, serverCount: 120, serverFloor: 620 }), 620);
// Restored older backup: 80 while the editor has seen 120
assert.equal(resolveSessionCounter({ local: 80, serverCount: 120, serverFloor: 620 }), 620);
// Older editor without a floor: at least what it reported (the previous behaviour)
assert.equal(resolveSessionCounter({ local: 0, serverCount: 120 }), 120);
assert.equal(resolveSessionCounter({ local: 0, serverCount: 120, serverFloor: null }), 120);
// A floor lower than the count (should not happen) can never lower it
assert.equal(resolveSessionCounter({ local: 0, serverCount: 120, serverFloor: 50 }), 120);
// Garbage in is treated as 0 and never lowers anything
assert.equal(resolveSessionCounter({ local: 'x', serverCount: undefined }), 0);
assert.equal(resolveSessionCounter({ local: 40, serverCount: 'abc' }), 40);
assert.equal(resolveSessionCounter({ local: '45', serverCount: '40' }), 45, 'numeric strings from sqlite/json');

// No UID numbers repeat: simulate issue -> wipe -> resume
{
    const issued = new Set<number>();
    let counter = 0, reported = 0;
    const margin = 500;
    const record = (n: number) => { for (let i = 0; i < n; i++) { counter++; assert.ok(!issued.has(counter), `number ${counter} reused`); issued.add(counter); } };
    record(100); reported = counter;             // reported to the editor
    record(30);                                  // recorded offline, never reported
    counter = 0;                                 // reinstall wipes the counter
    counter = resolveSessionCounter({ local: counter, serverCount: reported, serverFloor: reported + margin });
    record(50);                                  // no number from before may repeat
}

// Prefix: keep the one we have; never invent one
assert.equal(resolveUidPrefix('0K7A', 'FFFF'), '0K7A');
assert.equal(resolveUidPrefix(undefined, '1A2B'), '1A2B');
assert.equal(resolveUidPrefix('', ' 1A2B '), '1A2B');
assert.throws(() => resolveUidPrefix(undefined, undefined), /prefix/);
assert.throws(() => resolveUidPrefix('', ''), /prefix/);
assert.throws(() => resolveUidPrefix(null, '  '), /prefix/);

// Reporting: only when the tablet is ahead of what the editor knows
assert.equal(shouldReportCounter(130, 120), true, 'lost upload gets repaired');
assert.equal(shouldReportCounter(120, 120), false);
assert.equal(shouldReportCounter(100, 120), false, 'never report a lower number');
assert.equal(shouldReportCounter(5, undefined), true);
assert.equal(shouldReportCounter(0, 0), false, 'new tablet has nothing to report');

console.log('uid-counter tests passed');

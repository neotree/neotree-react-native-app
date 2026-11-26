// Run: npx tsx scripts/tests/calculations-edge-cases.test.ts
import assert from 'assert';
import { evalMath } from '../../src/utils/eval-math';
import { evalDateCalculation } from '../../src/utils/eval-date-calculation';
import { splitTopLevelArgs, unwrapCall, getReferencedKeys } from '../../src/utils/calculation-utils';

const e = (o: Record<string, any>) => Object.entries(o).map(([key, value]) => ({ key, value })) as any[];
const num = (f: any, o: Record<string, any> = {}) => { const r: any = evalMath(f, e(o)); return r.error ? `ERR` : r.result; };
const isErr = (x: unknown) => x === 'ERR';
const ymd = (d: Date) => `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
const dt = (f: any, o: Record<string, any> = {}) => { const r = evalDateCalculation(f, e(o)); return r.error ? 'ERR' : ymd(r.result!); };

// ---- helpers ------------------------------------------------------------------
assert.deepEqual(splitTopLevelArgs('a, b(c, d), e'), ['a', 'b(c, d)', 'e']);
assert.deepEqual(splitTopLevelArgs("a, 'x,y', \"p,q\""), ['a', "'x,y'", '"p,q"'], 'commas inside quotes');
assert.deepEqual(splitTopLevelArgs('a,,b'), ['a', '', 'b'], 'empty argument is kept so callers can reject it');
assert.deepEqual(splitTopLevelArgs(''), ['']);
assert.equal(unwrapCall('FIRST_OF($A, $B)', 'FIRST_OF'), '$A, $B');
assert.equal(unwrapCall('  FIRST_OF($A, $B)  ', 'FIRST_OF'), '$A, $B');
assert.equal(unwrapCall('FIRST_OF($A)+FIRST_OF($B)', 'FIRST_OF'), null, 'two calls are not one call');
assert.equal(unwrapCall('FIRST_OF($A, $B', 'FIRST_OF'), null, 'unbalanced');
assert.equal(unwrapCall('FIRST_OF ($A, $B)', 'FIRST_OF'), null, 'space before the parenthesis');
assert.equal(unwrapCall('first_of($A, $B)', 'FIRST_OF'), null, 'case-sensitive, as the editor writes it');
assert.equal(unwrapCall("DATE_ADD($A, 1, ')')", 'DATE_ADD'), "$A, 1, ')'", 'parenthesis inside quotes');
assert.deepEqual(getReferencedKeys('$A + $a + $Age_Days2 + $1x'), ['A', 'a', 'Age_Days2']);

// ---- FIRST_OF: malformed input must return an error, never throw --------------
for (const bad of ['FIRST_OF()', 'FIRST_OF($A,,$B)', 'FIRST_OF($A, $B', 'FIRST_OF($A, $B))', 'FIRST_OF($A)+FIRST_OF($B)', 'FIRST_OF ($A, $B)', 'FIRST_OF(,)', 'FIRST_OF(MATH($A +), $B)']) {
    assert.ok(isErr(num(bad, { A: 1, B: 2 })) || typeof num(bad, { A: 1, B: 2 }) === 'number', `no throw: ${bad}`);
}
assert.ok(isErr(num('FIRST_OF()', { A: 1 })));
assert.ok(isErr(num('FIRST_OF($A,,$B)', {})), 'empty option does not count as a value');
assert.equal(num('FIRST_OF($A,,$B)', { B: 2 }), 2, 'empty option is skipped when another has a value');
assert.equal(num('FIRST_OF(MATH($A +), $B)', { A: 1, B: 2 }), 2, 'a broken option falls through');
assert.equal(num(null as any, {}) !== undefined, true, 'null formula does not throw');
assert.equal(num(undefined as any, {}) !== undefined, true);

// ---- value shapes -------------------------------------------------------------
assert.equal(num('FIRST_OF($A, $B)', { A: '   ', B: 3 }), 3, 'whitespace-only is empty, not 0');
assert.equal(num('FIRST_OF($A, $B)', { A: null, B: 3 }), 3);
assert.equal(num('FIRST_OF($A, $B)', { A: undefined, B: 3 }), 3);
assert.equal(num('FIRST_OF($A, $B)', { A: NaN, B: 3 }), 3, 'NaN is not a value');
assert.equal(num('FIRST_OF($A, $B)', { A: Infinity, B: 3 }), 3, 'Infinity is not a value');
assert.equal(num('FIRST_OF($A, $B)', { A: '32.3', B: 3 }), 32.3, 'numeric strings');
assert.equal(num('FIRST_OF($A, $B)', { A: '-4', B: 3 }), -4, 'negative numbers');
assert.equal(num('FIRST_OF($A, $B)', { A: 0, B: 3 }), 0, 'zero is a value');
assert.equal(num('FIRST_OF($age, $B)', { Age: 5, B: 3 }), 5, 'key lookup ignores case');
assert.equal(num('FIRST_OF($Age_Days2, $B)', { Age_Days2: 5 }), 5, 'underscores and digits in keys');
assert.equal(num('MATH($Age + $AgeDays)', { Age: 1, AgeDays: 10 }), 11, 'a key that prefixes another');
assert.equal(num('FIRST_OF(MATH($Age + $AgeDays), $B)', { Age: 1, B: 3 }), 3, 'second key of the first option missing');

// ---- numeric edge results -----------------------------------------------------
assert.ok(isErr(num('MATH($A / $B)', { A: 1, B: 0 })), 'divide by zero');
assert.ok(isErr(num('MATH($A % $B)', { A: 1, B: 0 })), 'remainder by zero (NaN)');
assert.ok(isErr(num('MATH(Math.sqrt($A))', { A: -4 })), 'sqrt of a negative');
assert.ok(isErr(num('MATH(Math.pow($A, 1000))', { A: 10 })), 'overflow to Infinity');
assert.equal(num('MATH(Math.min($A, $B))', { A: 2, B: -2 }), -2);
assert.equal(num('MATH(Math.max(1, 2, 3, 4, 5))', {}), 5, 'many arguments');
assert.equal(num('MATH(Math.round(2.5))', {}), 3);
assert.equal(num('MATH(Math.round(-2.5))', {}), -2, 'matches JavaScript rounding');
assert.equal(num('MATH(Math.trunc(-0.5))', {}), 0 * -1 === 0 ? -0 : 0);
assert.equal(num('MATH(Math.abs(Math.floor(-1.5)))', {}), 2, 'nested functions');
assert.equal(num('MATH(Math.max(Math.min($A, 10), 0))', { A: 15 }), 10, 'clamp');
assert.equal(num('MATH(-$A)', { A: 3 }), -3);
assert.equal(num('MATH(2 ** 3)', {}), 8);
assert.ok(isErr(num('MATH(Math.max())', {})), 'no arguments');
assert.ok(isErr(num('MATH(Math.max(1,))', {})), 'trailing comma');
assert.ok(isErr(num('MATH(Math.floor 1)', {})), 'missing parenthesis');
assert.ok(isErr(num('MATH(Math.random())', {})), 'non-deterministic functions stay out');
assert.ok(isErr(num('MATH(Math.constructor)', {})));
assert.ok(isErr(num('MATH(Math.floor.call(1))', {})));
assert.ok(isErr(num('MATH(Math.PI)', {})), 'constants are not part of the grammar');
assert.ok(isErr(num("MATH(Math['floor'](1))", {})));
assert.ok(isErr(num('MATH((1)(2))', {})), 'call of a number');
assert.ok(isErr(num('MATH(1; 2)', {})));

// ---- dates: missing / malformed -----------------------------------------------
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: new Date(2026, 0, 31) }), '2026-02-01', 'Date objects are accepted');
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: '  2026-01-31  ' }), '2026-02-01', 'surrounding whitespace in the value');
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: '2026-01-31T00:00:00.000Z' }) !== 'ERR', true, 'ISO with Z');
for (const bad of ['', '   ', null, undefined, 'abc', '2026-13-45', '0000-00-00', NaN, {}, []]) {
    assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: bad }), 'ERR', `invalid base date: ${JSON.stringify(bad)}`);
}
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: 20260101 }) !== undefined, true, 'a number as a date does not throw');
assert.equal(dt("DATE_ADD($D, 1, 'Days')", { D: '2026-01-01' }), 'ERR', 'units are lowercase, as the editor writes them');
assert.equal(dt("DATE_ADD($D, 1, days)", { D: '2026-01-01' }), '2026-01-02', 'unquoted unit is tolerated');
assert.equal(dt('DATE_ADD($D, 1, "days")', { D: '2026-01-01' }), '2026-01-02', 'double-quoted unit');
assert.equal(dt("DATE_ADD($D, 0, 'days')", { D: '2026-01-01' }), '2026-01-01', 'zero amount');
assert.equal(dt("DATE_ADD($D, -0, 'days')", { D: '2026-01-01' }), '2026-01-01');
assert.equal(dt("DATE_ADD($D, 1e9, 'years')", { D: '2026-01-01' }), 'ERR', 'out-of-range result');
assert.equal(dt("DATE_ADD($D, 1e21, 'days')", { D: '2026-01-01' }), 'ERR');
assert.equal(dt("DATE_ADD($D, 100000, 'years')", { D: '2026-01-01' }), 'ERR', 'beyond the Date range');
assert.equal(dt("DATE_ADD($D, 1, 'days'", { D: '2026-01-01' }), 'ERR', 'unbalanced');
assert.equal(dt("DATE_ADD($D, 1, 'days'))", { D: '2026-01-01' }), 'ERR');
assert.equal(dt("DATE_ADD($D,1,'days')", { D: '2026-01-01' }), '2026-01-02', 'no spaces');
assert.equal(dt("  DATE_ADD(  $D ,  1 ,  'days'  )  ", { D: '2026-01-01' }), '2026-01-02', 'extra spaces');
assert.equal(dt("DATE_ADD($D, 1, 'days', 5)", { D: '2026-01-01' }), 'ERR', 'too many arguments');
assert.equal(dt("DATE_ADD(, 1, 'days')", {}), 'ERR');
assert.equal(dt("DATE_ADD($D, , 'days')", { D: '2026-01-01' }), 'ERR', 'empty amount');
assert.equal(dt("DATE_ADD($D, 1); process.exit(), 'days')", { D: '2026-01-01' }), 'ERR', 'no code');
assert.equal(dt("DATE_ADD($D, require('fs'), 'days')", { D: '2026-01-01' }), 'ERR');
assert.equal(dt("DATE_ADD($D, 'x', 'days')", { D: '2026-01-01' }), 'ERR', 'text amount');
assert.equal(dt("DATE_ADD(2026-01-01, 1, 'days')", {}), 'ERR', 'literal dates are not part of the grammar');
assert.equal(dt('$D', { D: '2026-01-01' }), '2026-01-01', 'a lone key is a date');
assert.equal(dt('MATH($A)', { A: 1 }), 'ERR', 'a number formula is not a date');

// sensible-range gate: 1900-2200 inclusive
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: '1900-01-01' }), '1900-01-02', 'lower bound is allowed');
assert.equal(dt("DATE_ADD($D, -1, 'days')", { D: '1900-01-01' }), 'ERR', 'one day below the range');
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: '2200-12-30' }), '2200-12-31', 'upper bound is allowed');
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: '2200-12-31' }), 'ERR', 'one day above the range');
{
    // out of range is reported, with the date, and is never hidden behind a fallback
    const r = evalDateCalculation("DATE_FIRST(DATE_ADD($A, 100000, 'years'), $B)", e({ A: '2026-01-01', B: '2026-02-02' }));
    assert.equal(r.result, null, 'no fallback for an out-of-range option');
    assert.ok(r.outOfRange instanceof Date && r.outOfRange.getFullYear() === 102026, 'the offending date is returned');
    assert.match(r.error!, /outside 1900-2200/);
    const plain = evalDateCalculation("DATE_ADD($A, -1, 'days')", e({ A: '1900-01-01' }));
    assert.ok(plain.outOfRange, 'plain DATE_ADD reports it too');
    const missing = evalDateCalculation("DATE_ADD($A, 1, 'days')", e({}));
    assert.equal(missing.outOfRange, undefined, 'a missing value is not an out-of-range error');
    const mixed = evalDateCalculation("DATE_FIRST(DATE_ADD($A, 1, 'days'), $B)", e({ B: '2026-02-02' }));
    assert.equal(ymd(mixed.result!), '2026-02-02', 'a missing first option still falls back normally');
}

// skip logic: a question hidden by a condition has no answer. That is "no value", never an error,
// and it is exactly what DATE_FIRST / FIRST_OF fallbacks are for.
{
    const hidden = (o: Record<string, any>) => Object.entries(o).map(([key, value]) => ({ key, value: value ?? null, valueText: null })) as any[];
    const run = (f: string, o: Record<string, any>) => evalDateCalculation(f, hidden(o));
    const none = run("DATE_ADD($LMP, 280, 'days')", { LMP: null });
    assert.equal(none.result, null);
    assert.equal(none.outOfRange, undefined, 'a skipped input is not an out-of-range error');
    const fb = run("DATE_FIRST(DATE_ADD($LMP, 280, 'days'), DATE_ADD($FALLBACK, 7, 'days'))", { LMP: null, FALLBACK: '2026-06-01' });
    assert.equal(ymd(fb.result!), '2026-06-08', 'skipped first question falls back silently');
    const key_absent = run("DATE_FIRST(DATE_ADD($LMP, 280, 'days'), $FALLBACK)", { FALLBACK: '2026-06-01' });
    assert.equal(ymd(key_absent.result!), '2026-06-01', 'a key not in the entry list at all is the same as a skipped one');
    // the skipped option never masks a real mistake in an option that does have values
    const real = run("DATE_FIRST(DATE_ADD($LMP, 280, 'days'), DATE_ADD($FALLBACK, 100000, 'years'))", { LMP: null, FALLBACK: '2026-06-01' });
    assert.ok(real.outOfRange, 'an out-of-range option that has values is still reported');
    // and a skipped option after a good one is irrelevant
    const good = run("DATE_FIRST(DATE_ADD($LMP, 1, 'days'), DATE_ADD($FALLBACK, 100000, 'years'))", { LMP: '2026-01-01', FALLBACK: null });
    assert.equal(ymd(good.result!), '2026-01-02');
    const num = evalMath('FIRST_OF(MATH($A * 2), MATH($B * 3))', hidden({ A: null, B: 2 }) as any) as any;
    assert.equal(num.result, 6, 'numeric fallback past a skipped question');
    // Existing behaviour, deliberately unchanged because live formulas depend on it: a plain
    // MATH(...) reads a skipped (null/empty) input as 0 rather than as "no value". Only the
    // new FIRST_OF and date calculations treat it as missing. Changing MATH would silently
    // change results of formulas already in use; do that as its own decision.
    const legacyNull = evalMath('MATH($A * 2 + $B)', hidden({ A: null, B: 5 }) as any) as any;
    assert.equal(legacyNull.result, 5, 'MATH treats a skipped input as 0 (legacy, unchanged)');
}

// amount from keys
assert.equal(dt("DATE_ADD($D, $N, 'days')", { D: '2026-01-01', N: '10' }), '2026-01-11', 'numeric-string amount');
assert.equal(dt("DATE_ADD($D, $N, 'days')", { D: '2026-01-01', N: -1 }), '2025-12-31', 'negative amount from a key');
assert.equal(dt("DATE_ADD($D, $N, 'days')", { D: '2026-01-01', N: '' }), 'ERR', 'empty amount key');
assert.equal(dt("DATE_ADD($D, $N, 'days')", { D: '2026-01-01', N: 1.5 }), 'ERR', 'fractional amount key');
assert.equal(dt("DATE_ADD($D, $N / 24, 'days')", { D: '2026-01-01', N: 48 }), '2026-01-03', 'hours to days');
assert.equal(dt("DATE_ADD($D, $N / 24, 'days')", { D: '2026-01-01', N: 50 }), 'ERR', 'hours that do not make whole days');
{
    const r = evalDateCalculation("DATE_ADD($D, $N, 'days')", [{ key: 'D', value: '2026-01-01' }, { key: 'N', value: null, exportValue: 4, type: 'period' }] as any);
    assert.equal(ymd(r.result!), '2026-01-05', 'period amount uses exportValue');
}

// ---- calendar arithmetic -------------------------------------------------------
assert.equal(dt("DATE_ADD($D, 1, 'months')", { D: '2026-03-31' }), '2026-04-30');
assert.equal(dt("DATE_ADD($D, -1, 'months')", { D: '2026-03-31' }), '2026-02-28');
assert.equal(dt("DATE_ADD($D, -1, 'months')", { D: '2028-03-31' }), '2028-02-29');
assert.equal(dt("DATE_ADD($D, 12, 'months')", { D: '2028-02-29' }), '2029-02-28', '12 months = 1 year');
assert.equal(dt("DATE_ADD($D, 4, 'years')", { D: '2024-02-29' }), '2028-02-29', 'leap day to leap day');
assert.equal(dt("DATE_ADD($D, 1, 'days')", { D: '2026-12-31' }), '2027-01-01', 'year rollover');
assert.equal(dt("DATE_ADD($D, -1, 'days')", { D: '2026-01-01' }), '2025-12-31');
assert.equal(dt("DATE_ADD($D, 365, 'days')", { D: '2028-01-01' }), '2028-12-31', 'a leap year has 366 days');
assert.equal(dt("DATE_ADD($D, 280, 'days')", { D: '2026-01-01' }), dt("DATE_ADD($D, 40, 'weeks')", { D: '2026-01-01' }), '280 days = 40 weeks');
// stepping is not associative around month ends; the order written is the order applied
assert.equal(dt("DATE_ADD(DATE_ADD($D, 1, 'months'), 1, 'days')", { D: '2026-01-31' }), '2026-03-01');
assert.equal(dt("DATE_ADD(DATE_ADD($D, 1, 'days'), 1, 'months')", { D: '2026-01-31' }), '2026-03-01');
assert.equal(dt("DATE_ADD(DATE_ADD($D, 1, 'months'), -1, 'months')", { D: '2026-01-31' }), '2026-01-28', 'clamping is lossy, as in a calendar');

// ---- DST: a day step keeps the local time of day --------------------------------
for (const tz of ['America/New_York', 'Europe/London', 'Africa/Harare', 'Australia/Lord_Howe']) {
    process.env.TZ = tz;
    const spring = evalDateCalculation("DATE_ADD($D, 1, 'days')", e({ D: '2026-03-07T22:30:00' })).result!;
    assert.equal(`${spring.getHours()}:${spring.getMinutes()}`, '22:30', `22:30 kept in ${tz}`);
    const long = evalDateCalculation("DATE_ADD($D, 280, 'days')", e({ D: '2026-01-01T08:00:00' })).result!;
    assert.equal(long.getHours(), 8, `08:00 kept across 280 days in ${tz}`);
    const month = evalDateCalculation("DATE_ADD($D, 6, 'months')", e({ D: '2026-01-15T09:15:00' })).result!;
    assert.equal(`${month.getHours()}:${month.getMinutes()}`, '9:15', `months keep the time in ${tz}`);
    assert.equal(dt("DATE_ADD($D, 280, 'days')", { D: '2026-01-01' }), '2026-10-08', `calendar day correct in ${tz}`);
}

// ---- DATE_FIRST -----------------------------------------------------------------
const F = "DATE_FIRST($A, $B, $C)";
assert.equal(dt(F, { C: '2026-03-03' }), '2026-03-03', 'only the last option has a value');
assert.equal(dt(F, { A: '2026-01-01', B: '2026-02-02', C: '2026-03-03' }), '2026-01-01', 'first wins even when later ones are earlier/later');
assert.equal(dt(F, { A: 'x', B: '', C: '2026-03-03' }), '2026-03-03', 'invalid and empty options are skipped');
assert.equal(dt('DATE_FIRST($A,,$B)', { B: '2026-02-02' }), '2026-02-02', 'empty option skipped');
assert.equal(dt('DATE_FIRST($A, $B)', {}), 'ERR');
assert.equal(dt("DATE_FIRST(DATE_ADD($A, 1.5, 'days'), $B)", { A: '2026-01-01', B: '2026-02-02' }), '2026-02-02', 'a broken option falls through');
assert.equal(dt("DATE_FIRST(DATE_ADD($A, 1, 'days'), $B)", { A: '2026-01-01' }), '2026-01-02');
assert.equal(dt("DATE_FIRST($A, $B)", { A: '2026-01-01' }), '2026-01-01');
assert.equal(dt("DATE_ADD(DATE_FIRST($A, $B), 1, 'days')", { B: '2026-02-02' }), '2026-02-03', 'DATE_FIRST as the base of DATE_ADD');
assert.equal(dt("DATE_FIRST(DATE_ADD(DATE_FIRST($A, $B), 1, 'days'), $C)", { C: '2026-05-05' }), '2026-05-05', 'nested, inner has no value');

console.log('calculation edge-case tests passed');

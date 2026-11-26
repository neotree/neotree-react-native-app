// Run: npx tsx scripts/tests/calculations.test.ts   (no test framework in this repo)
import assert from 'assert';
import { evalMath } from '../../src/utils/eval-math';
import { evalDateCalculation, isDateCalculation } from '../../src/utils/eval-date-calculation';

const v = (o: Record<string, any>, types: Record<string, string> = {}) =>
    Object.entries(o).map(([key, value]) => ({ key, value, type: types[key] })) as any[];
const math = (f: string, o: Record<string, any>) => { const r = evalMath(f, v(o)); return r.error ? `ERR:${r.error}` : r.result; };
const date = (f: string, o: Record<string, any>, types: Record<string, string> = {}) => {
    const r = evalDateCalculation(f, v(o, types));
    return r.error ? `ERR:${r.error}` : `${r.result!.getFullYear()}-${`${r.result!.getMonth() + 1}`.padStart(2, '0')}-${`${r.result!.getDate()}`.padStart(2, '0')}`;
};

// ---- Existing behaviour is unchanged ---------------------------------------
const GA = 'MATH(Math.floor($Gestation) +  Math.floor(($Age / 24) / 7)   + Math.floor((Math.round(($Gestation - Math.floor($Gestation)) * 10)   + Math.floor(($Age / 24) % 7)) / 7)   +((Math.round(($Gestation - Math.floor($Gestation)) * 10)   + Math.floor(($Age / 24) % 7)) % 7) / 10) ';
assert.equal(math(GA, { Gestation: 32.3, Age: 2400 }), 46.5, 'production gestation formula (trailing space tolerated)');
assert.equal(math(GA, { Gestation: 34.6, Age: 240 }), 36.2);
assert.equal(math('MATH($A + $B * 2)', { A: 1, B: 3 }), 7);
assert.equal(math('SUM($A,$B)', { A: 1, B: 3 }), 4);
assert.equal(math('MULTIPLY($A,$B)', { A: 2, B: 3 }), 6);
assert.equal(math('DIVIDE($A,$B)', { A: 6, B: 3 }), 2);
assert.equal(math('SUBTRACT($A,$B)', { A: 6, B: 3 }), 3);
assert.equal(math('$A', { A: 5 }), 5);
assert.ok(String(math('MATH($Missing + 1)', {})).startsWith('ERR:'), 'MATH still reports a missing value');
assert.ok(String(math('MATH(eval("1"))', {})).startsWith('ERR:'), 'still no arbitrary functions');
assert.ok(String(math('MATH(process.exit())', {})).startsWith('ERR:'));

// ---- More Math functions ---------------------------------------------------
assert.equal(math('MATH(Math.ceil($A))', { A: 1.2 }), 2);
assert.equal(math('MATH(Math.trunc($A))', { A: -1.7 }), -1);
assert.equal(math('MATH(Math.abs($A))', { A: -3 }), 3);
assert.equal(math('MATH(Math.sqrt($A))', { A: 9 }), 3);
assert.equal(math('MATH(Math.pow($A, 2))', { A: 3 }), 9);
assert.equal(math('MATH(Math.min($A, $B, 2))', { A: 5, B: 3 }), 2);
assert.equal(math('MATH(Math.max($A, $B))', { A: 5, B: 3 }), 5);
assert.ok(String(math('MATH(Math.pow($A))', { A: 1 })).startsWith('ERR:'), 'arity enforced');
assert.ok(String(math('MATH(Math.floor($A, 1))', { A: 1 })).startsWith('ERR:'));
assert.ok(String(math('MATH(Math.sqrt($A))', { A: -1 })).startsWith('ERR:'), 'NaN is an error');

// ---- FIRST_OF ---------------------------------------------------------------
assert.equal(math('FIRST_OF(MATH($A + 1), MATH($B * 2))', { A: 2, B: 4 }), 3, 'first wins');
assert.equal(math('FIRST_OF(MATH($A + 1), MATH($B * 2))', { B: 4 }), 8, 'falls back when first is missing');
assert.equal(math('FIRST_OF(MATH($A + 1), MATH($B * 2))', { A: '', B: 4 }), 8, 'empty string counts as missing');
assert.equal(math('FIRST_OF(MATH($A + 1), MATH($B * 2))', { A: 'abc', B: 4 }), 8, 'non-number counts as missing');
assert.equal(math('FIRST_OF($A, $B)', { B: 7 }), 7);
assert.equal(math('FIRST_OF($A, SUM($B, 1))', { B: 7 }), 8);
assert.equal(math('FIRST_OF(MATH($A / $Z), $B)', { A: 1, Z: 0, B: 9 }), 9, 'error/invalid option falls through');
assert.equal(math('FIRST_OF(MATH($A), MATH($B))', { A: 0, B: 9 }), 0, 'zero is a value');
assert.equal(math('  FIRST_OF($A, $B)  ', { A: 1 }), 1, 'surrounding whitespace');
assert.equal(math('FIRST_OF($A, FIRST_OF($B, $C))', { C: 3 }), 3, 'nested');
assert.equal(String(math('FIRST_OF($A, $B)', {})), 'ERR:No option has a value');
assert.ok(String(math('FIRST_OF($A)', { A: 1 })).startsWith('ERR:'), 'needs 2 options');
assert.equal(evalMath('FIRST_OF($A, $B)', [{ key: 'A', value: null, exportValue: 5, type: 'period' }, { key: 'B', value: 1 }] as any).result, 5, 'period values use exportValue');

// ---- Dates ------------------------------------------------------------------
const D = { LMPDate: '2026-01-01' };
assert.ok(isDateCalculation("DATE_ADD($A, 1, 'days')") && isDateCalculation(' DATE_FIRST($A, $B)') && !isDateCalculation('MATH($A)') && !isDateCalculation(''));
assert.equal(date("DATE_ADD($LMPDate, 280, 'days')", D), '2026-10-08');
assert.equal(date("DATE_ADD($LMPDate, 2, 'weeks')", D), '2026-01-15');
assert.equal(date("DATE_ADD($LMPDate, 1, 'years')", D), '2027-01-01');
assert.equal(date("DATE_ADD($LMPDate, 1, 'months')", { LMPDate: '2026-01-31' }), '2026-02-28', 'month-end clamps');
assert.equal(date("DATE_ADD($LMPDate, 1, 'months')", { LMPDate: '2028-01-31' }), '2028-02-29', 'leap year');
assert.equal(date("DATE_ADD($LMPDate, 1, 'years')", { LMPDate: '2028-02-29' }), '2029-02-28');
assert.equal(date("DATE_ADD($LMPDate, -3, 'months')", { LMPDate: '2026-01-15' }), '2025-10-15', 'crosses a year');
assert.equal(date("DATE_ADD(DATE_ADD($LNMP, 7, 'days'), -3, 'months')", { LNMP: '2026-05-31T10:00:00' }), '2026-03-07', 'nested steps');
assert.equal(date("DATE_ADD($LMPDate, $Days, 'days')", { ...D, Days: 10 }), '2026-01-11', 'amount from a key');
assert.equal(date("DATE_ADD($LMPDate, 7*2, 'days')", D), '2026-01-15', 'amount arithmetic');
assert.equal(date("DATE_ADD($LMPDate, 1, 'days')", { LMPDate: '2026-03-28' }), '2026-03-29');
assert.equal(date("DATE_ADD($LMPDate, 1, 'days')", { LMPDate: '2026-10-24 08:30' }), '2026-10-25', 'space-separated datetime');
{
    const r = evalDateCalculation("DATE_ADD($T, 1, 'days')", v({ T: '2026-03-28T22:15:00' }));
    assert.equal(r.result!.getHours(), 22, 'time of day kept across a day step');
    assert.equal(r.result!.getMinutes(), 15);
}
// missing / invalid inputs
assert.ok(date("DATE_ADD($LMPDate, 1, 'days')", {}).startsWith('ERR:'));
assert.ok(date("DATE_ADD($LMPDate, 1, 'days')", { LMPDate: 'garbage' }).startsWith('ERR:'));
assert.ok(date("DATE_ADD($LMPDate, 1.5, 'days')", D).startsWith('ERR:'), 'fractional amount rejected');
assert.ok(date("DATE_ADD($LMPDate, 1, 'fortnights')", D).startsWith('ERR:'));
assert.ok(date("DATE_ADD($LMPDate, 1)", D).startsWith('ERR:'));
assert.ok(date("DATE_ADD($LMPDate, $Nope, 'days')", D).startsWith('ERR:'));
assert.ok(date("DATE_ADD($LMPDate, 1, 'days') + 1", D).startsWith('ERR:'), 'trailing text rejected');
assert.ok(date("DATE_ADD(eval(1), 1, 'days')", D).startsWith('ERR:'), 'no code');
assert.ok(date("DATE_ADD($LMPDate, process.exit(), 'days')", D).startsWith('ERR:'), 'no code in the amount');
// DATE_FIRST
const F = "DATE_FIRST(DATE_ADD($DOBTOB, 280, 'days'), DATE_ADD(DATE_ADD($FALLBACKDATE, 7, 'days'), -3, 'months'))";
assert.equal(date(F, { DOBTOB: '2026-01-01', FALLBACKDATE: '2026-06-01' }), '2026-10-08', 'first wins');
assert.equal(date(F, { FALLBACKDATE: '2026-06-01' }), '2026-03-08', 'falls back');
assert.equal(date(F, { DOBTOB: '', FALLBACKDATE: '2026-06-01' }), '2026-03-08', 'empty first date');
assert.equal(date(F, { DOBTOB: 'bad', FALLBACKDATE: '2026-06-01' }), '2026-03-08', 'invalid first date');
assert.equal(date('DATE_FIRST($A, $B)', { B: '2026-02-02' }), '2026-02-02', 'bare date keys');
assert.equal(date('DATE_FIRST($A, DATE_FIRST($B, $C))', { C: '2026-02-03' }), '2026-02-03', 'nested');
assert.ok(date(F, {}).startsWith('ERR:'), 'no option has a value');
assert.ok(date('DATE_FIRST($A)', { A: '2026-01-01' }).startsWith('ERR:'), 'needs two options');

console.log('calculation tests passed');

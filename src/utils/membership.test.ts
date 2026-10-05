/**
 * NEOAPP-1514 — membership operator tests.
 *
 * No test runner is installed in this repo, so these run on Node's own type
 * stripping and assert module:
 *
 *   node --experimental-strip-types src/utils/membership.test.ts
 */
import assert from 'node:assert/strict';

import { collectAnsweredValues, parseValueList, resolveMemberships, hasMembership, findClosingParen } from './membership';
import type { MembershipEntry } from './membership';

let passed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
    try {
        fn();
        passed++;
    } catch (error: any) {
        failures.push(`${name}\n    ${error?.message?.split('\n')[0] || error}`);
    }
}

/** An answer stored as option objects, the shape a multi select produces. */
const options = (key: string, ...values: string[]): MembershipEntry => ({
    values: [{ key, value: values.map(v => ({ key: v, value: v })) }],
});

/** An answer stored as a bare scalar, the shape an outcome or single select produces. */
const scalar = (key: string, value: any): MembershipEntry => ({
    values: [{ key, value }],
});

// ---------------------------------------------------------------- value list

test('parseValueList strips single, double and back quotes', () => {
    assert.deepEqual(parseValueList(`'BID', "DDA", \`NND\``), ['bid', 'dda', 'nnd']);
});

test('parseValueList tolerates ragged spacing and empty slots', () => {
    assert.deepEqual(parseValueList(`  'BID' ,, 'STB'  `), ['bid', 'stb']);
});

// ------------------------------------------------------------ answer lookup

test('collectAnsweredValues reads option objects', () => {
    assert.deepEqual(
        [...collectAnsweredValues([options('NeotreeOutcome', 'NND', 'STB')], '$NeotreeOutcome')],
        ['nnd', 'stb'],
    );
});

test('collectAnsweredValues prefers an option value over its item id', () => {
    const form = [{ values: [{ key: 'Signs', value: [{ key: 'uuid-1', value: 'A' }] }] }];
    assert.deepEqual([...collectAnsweredValues(form, '$Signs')], ['a']);
});

test('collectAnsweredValues reads bare scalar answers', () => {
    // The previous implementation only ever looked at `v.key`, so a scalar
    // answer was invisible to every membership check.
    assert.deepEqual([...collectAnsweredValues([scalar('NeotreeOutcome', 'NND')], '$NeotreeOutcome')], ['nnd']);
});

test('collectAnsweredValues matches keys case-insensitively', () => {
    assert.deepEqual([...collectAnsweredValues([scalar('neotreeoutcome', 'NND')], '$NeotreeOutcome')], ['nnd']);
});

test('collectAnsweredValues ignores other keys', () => {
    assert.deepEqual([...collectAnsweredValues([scalar('SomethingElse', 'NND')], '$NeotreeOutcome')], []);
});

// -------------------------------------------------------------------- single

test('excludes is true when the value is absent', () => {
    assert.equal(resolveMemberships(`$NeotreeOutcome excludes ('BID')`, [scalar('NeotreeOutcome', 'NND')]), 'true');
});

test('excludes is false when the value is present', () => {
    // Regression: the negation was commented out, so this returned true.
    assert.equal(resolveMemberships(`$NeotreeOutcome excludes ('BID')`, [scalar('NeotreeOutcome', 'BID')]), 'false');
});

test('includes is true when the value is present', () => {
    assert.equal(resolveMemberships(`$NeotreeOutcome includes ('BID')`, [scalar('NeotreeOutcome', 'BID')]), 'true');
});

// ---------------------------------------------------------------- multi value

test('excludes over several values is true when none match', () => {
    // Regression (the ticket): this used to emit bare "and" keywords, so eval()
    // threw and the condition silently became false.
    assert.equal(
        resolveMemberships(`$NeotreeOutcome excludes ('BID','DDA','NND','STB')`, [scalar('NeotreeOutcome', 'LIV')]),
        'true',
    );
});

test('excludes over several values is false when one matches', () => {
    assert.equal(
        resolveMemberships(`$NeotreeOutcome excludes ('BID','DDA','NND','STB')`, [scalar('NeotreeOutcome', 'NND')]),
        'false',
    );
});

test('includes over several values means any of them', () => {
    assert.equal(resolveMemberships(`$Signs includes ('A','B')`, [options('Signs', 'A', 'B')]), 'true');
    assert.equal(resolveMemberships(`$Signs includes ('A','B')`, [options('Signs', 'A')]), 'true');
    assert.equal(resolveMemberships(`$Signs includes ('A','B')`, [options('Signs', 'C')]), 'false');
});

test('includes and excludes are exact inverses over every answer', () => {
    // The editor rewrites !(X includes (...)) to X excludes (...), so the two
    // must never both be true or both be false for the same answer.
    const answers = [[], ['A'], ['B'], ['A', 'B'], ['C'], ['A', 'C']];
    for (const answer of answers) {
        const form = [options('Signs', ...answer)];
        const inc = resolveMemberships(`$Signs includes ('A','B')`, form);
        const exc = resolveMemberships(`$Signs excludes ('A','B')`, form);
        assert.notEqual(inc, exc, `answer [${answer}] gave includes=${inc} excludes=${exc}`);
    }
});

test('or_includes is a legacy alias for includes', () => {
    assert.equal(resolveMemberships(`$Signs or_includes ('A','B')`, [options('Signs', 'A')]), 'true');
    assert.equal(resolveMemberships(`$Signs or_includes ('A','B')`, [options('Signs', 'C')]), 'false');
});

test('or_excludes keeps its legacy "at least one absent" meaning', () => {
    assert.equal(resolveMemberships(`$Signs or_excludes ('A','B')`, [options('Signs', 'A')]), 'true');
    assert.equal(resolveMemberships(`$Signs or_excludes ('A','B')`, [options('Signs', 'A', 'B')]), 'false');
});

// ------------------------------------------------------------- composition

test('a membership composes with another term on the same line', () => {
    // Regression: the old branch returned early and discarded "and ($DRU = false)".
    assert.equal(
        resolveMemberships(`$NeotreeOutcome excludes ('BID','STB') and ($DRU = false)`, [scalar('NeotreeOutcome', 'LIV')]),
        `true and ($DRU = false)`,
    );
});

test('two memberships on one line both resolve', () => {
    assert.equal(
        resolveMemberships(
            `$A includes ('X') or $B excludes ('Y')`,
            [scalar('A', 'X'), scalar('B', 'Y')],
        ),
        'true or false',
    );
});

test('non-membership expressions pass through untouched', () => {
    const expression = `$NeotreeOutcome != 'BID' and $DRU = false`;
    assert.equal(resolveMemberships(expression, []), expression);
});

// -------------------------------------------------------------- edge cases

test('an unanswered key excludes everything and includes nothing', () => {
    assert.equal(resolveMemberships(`$Missing excludes ('BID')`, []), 'true');
    assert.equal(resolveMemberships(`$Missing includes ('BID')`, []), 'false');
});

test('an empty value list is left alone rather than given a verdict', () => {
    assert.equal(resolveMemberships(`$Outcome excludes ()`, []), `$Outcome excludes ()`);
});

test('operators and values are case-insensitive', () => {
    assert.equal(resolveMemberships(`$Outcome EXCLUDES ('bid')`, [scalar('Outcome', 'BID')]), 'false');
});

test('hasMembership does not leak regex state between calls', () => {
    const expression = `$A includes ('X')`;
    assert.equal(hasMembership(expression), true);
    assert.equal(hasMembership(expression), true);
    assert.equal(hasMembership(`$A = 'X'`), false);
});

test('resolveMemberships does not leak regex state between calls', () => {
    const expression = `$A includes ('X')`;
    const form = [scalar('A', 'X')];
    assert.equal(resolveMemberships(expression, form), 'true');
    assert.equal(resolveMemberships(expression, form), 'true');
});


// ------------------------------------------- values with parens and commas

test('a value containing parentheses survives', () => {
    // A regex stopping at the first ")" produced the garbage string "false')",
    // which then threw inside eval and silently became false.
    const form = [scalar('Drug', 'Amoxicillin (oral)')];
    assert.equal(resolveMemberships(`$Drug includes ('Amoxicillin (oral)')`, form), 'true');
    assert.equal(resolveMemberships(`$Drug excludes ('Amoxicillin (oral)')`, form), 'false');
});

test('a value containing a comma stays one value', () => {
    assert.deepEqual(parseValueList(`'Fever, high'`), ['fever, high']);
    assert.equal(resolveMemberships(`$S includes ('Fever, high')`, [scalar('S', 'Fever, high')]), 'true');
});

test('a parenthesised value still composes with the rest of the line', () => {
    assert.equal(
        resolveMemberships(`$Drug excludes ('Amoxicillin (oral)') and $DRU = false`, [scalar('Drug', 'Gentamicin')]),
        `true and $DRU = false`,
    );
});

test('unbalanced parentheses are left alone rather than guessed at', () => {
    const expression = `$Drug includes ('A'`;
    assert.equal(resolveMemberships(expression, []), expression);
});

test('findClosingParen ignores parens inside quotes', () => {
    const src = `($Drug includes ('a)b'))`;
    assert.equal(findClosingParen(src, src.indexOf('(', 1)), src.length - 2);
});


// ---------------------------------------------------- manual entry (value2)

test('manual entry on a plain field is not visible under its own key', () => {
    // Matches substitution: the primary value is substituted first, so the
    // value2 clone never gets a token. Only key2 exposes it. Verified against
    // the real pipeline in condition-pipeline.test.ts.
    const form = [{ values: [{ key: 'Other', value: 'OTH', value2: 'Sepsis' }] }];
    assert.equal(resolveMemberships(`$Other includes ('Sepsis')`, form), 'false');
    assert.equal(resolveMemberships(`$Other includes ('OTH')`, form), 'true');
});

test('manual entry on a multi-select option IS visible under the field key', () => {
    const form = [{ values: [{ key: 'Signs', value: [{ key: 'id-1', value: 'OTH', value2: 'Sepsis' }] }] }];
    assert.equal(resolveMemberships(`$Signs includes ('Sepsis')`, form), 'true');
});

test('a multi-select option matches on its value, not its internal id', () => {
    // `key` is the item id; `value` is the answer the rest of the runtime uses.
    const form = [{ values: [{ key: 'Signs', value: [{ key: 'uuid-1234', value: 'A' }] }] }];
    assert.equal(resolveMemberships(`$Signs includes ('A')`, form), 'true');
    assert.equal(resolveMemberships(`$Signs includes ('uuid-1234')`, form), 'false');
});

test('membership sees manual-entry text under key2', () => {
    const form = [{ values: [{ key: 'Dx', value: 'OTH', value2: 'Sepsis', key2: 'DxOther' }] }];
    assert.equal(resolveMemberships(`$DxOther includes ('Sepsis')`, form), 'true');
    assert.equal(resolveMemberships(`$Dx includes ('OTH')`, form), 'true');
});

test('value2 does not leak into unrelated keys', () => {
    const form = [{ values: [{ key: 'Dx', value: 'OTH', value2: 'Sepsis', key2: 'DxOther' }] }];
    assert.equal(resolveMemberships(`$Somethingelse includes ('Sepsis')`, form), 'false');
});

// ------------------------------------------------------------------- report

if (failures.length) {
    console.error(`\n${failures.length} failed, ${passed} passed\n`);
    failures.forEach(f => console.error(`  ✗ ${f}`));
    console.error('');
    process.exit(1);
}
console.log(`\n  ${passed} passed\n`);

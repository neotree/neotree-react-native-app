/**
 * End-to-end tests for the conditional-expression pipeline.
 *
 * These run the real shipped code — compileCondition and createBuildForm, the
 * same functions the script context calls — and evaluate the compiled output
 * the same way the runtime does. Nothing here re-implements the algorithm.
 *
 *   node --experimental-strip-types src/utils/condition-pipeline.test.ts
 */
import assert from 'node:assert/strict';

import { compileCondition, createBuildForm } from './condition-pipeline';
import { buildOutcomeEntries } from './outcome-collections';

let passed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
    try { fn(); passed++; } catch (error: any) {
        failures.push(`${name}\n    ${error?.message?.split('\n')[0] || error}`);
    }
}

/** Exactly what evaluateCondition does in the context. */
function evaluateCompiled(compiled: string, defaultEval = false): boolean {
    try { return !!eval(compiled); } catch { return defaultEval; }
}

type Answer = { key: string; value: any; dataType?: string; type?: string; value2?: any; key2?: string };

/** Evaluates `expression` against a plain form screen of answers. */
function run(
    expression: string,
    answers: Answer[],
    opts: { configuration?: Record<string, any> | null; extra?: any[]; screenType?: string } = {},
): boolean {
    const entries = [
        { screen: { id: 'form', type: opts.screenType || 'form' }, values: answers },
        ...(opts.extra || []),
    ];
    const buildForm = createBuildForm({ entries, outcomeEntries: buildOutcomeEntries(entries) });
    return evaluateCompiled(compileCondition(expression, [], { buildForm, configuration: opts.configuration ?? null }));
}

const dxScreen = (...dx: { key: string; how_agree?: string }[]) => ({
    screen: { id: 'dx', type: 'diagnosis' },
    values: dx.map(d => ({ key: d.key, value: d.key, type: 'diagnosis', diagnosis: { how_agree: d.how_agree ?? null } })),
});

// ---------------------------------------------------------- comparisons

test('equality, inequality and ordering', () => {
    const a: Answer[] = [{ key: 'Sex', value: 'M' }, { key: 'RR', value: 70 }];
    assert.equal(run(`$Sex = 'M'`, a), true);
    assert.equal(run(`$Sex = 'F'`, a), false);
    assert.equal(run(`$Sex != 'F'`, a), true);
    assert.equal(run(`$RR > 60`, a), true);
    assert.equal(run(`$RR < 60`, a), false);
});

test('values compare case-insensitively', () => {
    assert.equal(run(`$Sex = 'm'`, [{ key: 'Sex', value: 'M' }]), true);
});

test('booleans', () => {
    const a: Answer[] = [{ key: 'DRU', value: false, dataType: 'boolean' }];
    assert.equal(run(`$DRU = false`, a), true);
    assert.equal(run(`$DRU = true`, a), false);
});

test('and / or', () => {
    const a: Answer[] = [{ key: 'Sex', value: 'M' }, { key: 'RR', value: 70 }];
    assert.equal(run(`$Sex = 'M' and $RR > 60`, a), true);
    assert.equal(run(`$Sex = 'F' and $RR > 60`, a), false);
    assert.equal(run(`$Sex = 'F' or $RR > 60`, a), true);
});

test('an unanswered key is false under = and true under !=', () => {
    // Documents the runtime's long-standing behaviour: an unsubstituted $key
    // survives as a string literal, so it never equals a real value.
    assert.equal(run(`$Missing = 'x'`, []), false);
    assert.equal(run(`$Missing != 'x'`, []), true);
});

// ------------------------------------------------------------ structure

test('lines are implicitly ANDed', () => {
    const a: Answer[] = [{ key: 'A', value: '1' }, { key: 'B', value: '2' }];
    assert.equal(run(`$A = '1'\n$B = '2'`, a), true);
    assert.equal(run(`$A = '1'\n$B = '9'`, a), false);
});

test('bracket groups compile independently', () => {
    const a: Answer[] = [{ key: 'A', value: '1' }, { key: 'B', value: '2' }];
    assert.equal(run(`[$A = '1'] and [$B = '2']`, a), true);
    assert.equal(run(`[$A = '1'] and [$B = '9']`, a), false);
});

test('configuration keys substitute as booleans', () => {
    assert.equal(run(`$SomeConfig = true`, [], { configuration: { SomeConfig: 1 } }), true);
    assert.equal(run(`$SomeConfig = true`, [], { configuration: { SomeConfig: 0 } }), false);
});

// ----------------------------------------------------------- membership

test('excludes over several values (NEOAPP-1514)', () => {
    const ce = `$NeotreeOutcome excludes ('BID','DDA','NND','STB')`;
    assert.equal(run(ce, [{ key: 'NeotreeOutcome', value: 'LIV' }]), true);
    assert.equal(run(ce, [{ key: 'NeotreeOutcome', value: 'NND' }]), false);
});

test('includes means any of', () => {
    const ce = `$NeotreeOutcome includes ('BID','NND')`;
    assert.equal(run(ce, [{ key: 'NeotreeOutcome', value: 'NND' }]), true);
    assert.equal(run(ce, [{ key: 'NeotreeOutcome', value: 'LIV' }]), false);
});

test('membership composes with other terms on one line', () => {
    const ce = `$NeotreeOutcome excludes ('BID','STB') and $DRU = false`;
    const dru: Answer = { key: 'DRU', value: false, dataType: 'boolean' };
    assert.equal(run(ce, [{ key: 'NeotreeOutcome', value: 'LIV' }, dru]), true);
    assert.equal(run(ce, [{ key: 'NeotreeOutcome', value: 'BID' }, dru]), false);
});

test('membership inside a bracket group', () => {
    assert.equal(run(`[$Outcome excludes ('BID')] and $DRU = false`,
        [{ key: 'Outcome', value: 'LIV' }, { key: 'DRU', value: false, dataType: 'boolean' }]), true);
});

test('a value containing parentheses survives', () => {
    assert.equal(run(`$Drug includes ('Amoxicillin (oral)')`, [{ key: 'Drug', value: 'Amoxicillin (oral)' }]), true);
});

// ------------------------------------------------------ multi select

test('a multi_select answer matches any selected value', () => {
    // Real shape from _TypeMultiSelect: the outer value holds the field key and
    // an array of options; each option carries the answer in `value`, its
    // internal id in `key`, and the field key in `inputKey`.
    const answers: any[] = [{ key: 'Signs', value: [
        { key: 'id-a', value: 'A', inputKey: 'Signs' },
        { key: 'id-b', value: 'B', inputKey: 'Signs' },
    ] }];
    assert.equal(run(`$Signs = 'A'`, answers, { screenType: 'multi_select' }), true);
    assert.equal(run(`$Signs = 'B'`, answers, { screenType: 'multi_select' }), true);
    assert.equal(run(`$Signs = 'C'`, answers, { screenType: 'multi_select' }), false);
});

test('membership agrees with = on a multi_select answer', () => {
    // The two must never disagree; membership used to read the item id here.
    const answers: any[] = [{ key: 'Signs', value: [{ key: 'id-a', value: 'A', inputKey: 'Signs' }] }];
    const opts = { screenType: 'multi_select' };
    assert.equal(run(`$Signs = 'A'`, answers, opts), run(`$Signs includes ('A')`, answers, opts));
    assert.equal(run(`$Signs = 'Z'`, answers, opts), run(`$Signs includes ('Z')`, answers, opts));
});

test('manual entry on a plain field is NOT answerable under its own key', () => {
    // The primary value is substituted first, leaving no $Other for the value2
    // clone. This is long-standing behaviour, pinned so membership stays in
    // step with it.
    assert.equal(run(`$Other = 'Sepsis'`, [{ key: 'Other', value: 'OTH', value2: 'Sepsis' }]), false);
    assert.equal(run(`$Other = 'OTH'`, [{ key: 'Other', value: 'OTH', value2: 'Sepsis' }]), true);
});

test('manual entry on a multi_select option IS answerable under the field key', () => {
    const answers: any[] = [{ key: 'Signs', value: [
        { key: 'id-o', value: 'OTH', value2: 'Sepsis', inputKey: 'Signs' },
    ] }];
    assert.equal(run(`$Signs = 'Sepsis'`, answers, { screenType: 'multi_select' }), true);
});

test('manual-entry text is answerable under key2', () => {
    assert.equal(run(`$OtherText = 'Sepsis'`, [{ key: 'Other', value: 'OTH', value2: 'Sepsis', key2: 'OtherText' }]), true);
});

// ------------------------------------------------- outcome collections

test('$Diagnoses resolves to confirmed diagnoses', () => {
    assert.equal(run(`$Diagnoses = 'RDN'`, [], { extra: [dxScreen({ key: 'RDN' })] }), true);
    assert.equal(run(`$Diagnoses = 'RDN'`, [], { extra: [dxScreen({ key: 'SEPSIS' })] }), false);
});

test('$Diagnoses ignores a rejected suggestion', () => {
    assert.equal(run(`$Diagnoses = 'RDN'`, [], { extra: [dxScreen({ key: 'RDN', how_agree: 'No' })] }), false);
});

test('$Diagnoses is false before the diagnosis screen has run', () => {
    // Screen order is set in the web editor and is dynamic, so this must hold
    // wherever the consuming screen sits.
    assert.equal(run(`$Diagnoses = 'RDN'`, []), false);
});

test('$Problems resolves to confirmed problems', () => {
    const problems = { screen: { id: 'pb', type: 'problems' }, values: [{ key: 'Yell', value: 'Yell', problem: { how_agree: null } }] };
    assert.equal(run(`$Problems = 'Yell'`, [], { extra: [problems] }), true);
    assert.equal(run(`$Problems = 'Cold'`, [], { extra: [problems] }), false);
});

test('the real CPAP condition behaves correctly', () => {
    const ce = `($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or $Diagnoses = 'RDN' or $Diagnoses = 'PREMRDS') and $NobCPAP = false`;
    const obs: Answer[] = [
        { key: 'DangerSigns', value: 'None' }, { key: 'RR', value: 40 },
        { key: 'SatsO2', value: 98 }, { key: 'WOB', value: 'None' },
        { key: 'NobCPAP', value: false, dataType: 'boolean' },
    ];
    assert.equal(run(ce, obs), false, 'no diagnoses yet');
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'RDN' })] }), true, 'RDN confirmed');
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'RDN', how_agree: 'No' })] }), false, 'RDN rejected');
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'SEPSIS' }, { key: 'PREMRDS' })] }), true, 'PREMRDS among several');
    assert.equal(run(`$DangerSigns = 'Grun'`, [{ key: 'DangerSigns', value: 'Grun' }]), true, 'other clauses unaffected');
});

test('the bracketed membership form the editor prescribes for $Diagnoses', () => {
    // The editor now rejects `$Diagnoses = 'RDN'` and offers
    // `[$Diagnoses includes ('RDN')]`. The runtime has to agree with that form.
    const obs: Answer[] = [
        { key: 'DangerSigns', value: 'None' }, { key: 'RR', value: 40 },
        { key: 'SatsO2', value: 98 }, { key: 'WOB', value: 'None' },
        { key: 'NobCPAP', value: false, dataType: 'boolean' },
    ];
    const ce = `($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or [$Diagnoses includes ('RDN')] or [$Diagnoses includes ('PREMRDS')]) and $NobCPAP = false`;

    assert.equal(run(ce, obs), false, 'no diagnoses yet');
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'RDN' })] }), true, 'RDN confirmed');
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'PREMRDS' })] }), true, 'PREMRDS confirmed');
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'SEPSIS' })] }), false, 'unrelated diagnosis');
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'RDN', how_agree: 'No' })] }), false, 'rejected');
});

test('the collapsed membership form gives the same answers', () => {
    const obs: Answer[] = [{ key: 'NobCPAP', value: false, dataType: 'boolean' }];
    const ce = `[$Diagnoses includes ('RDN','PREMRDS')] and $NobCPAP = false`;
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'PREMRDS' })] }), true);
    assert.equal(run(ce, obs, { extra: [dxScreen({ key: 'SEPSIS' })] }), false);
    assert.equal(run(ce, obs), false);
});

test('excludes on $Diagnoses is safe when nothing is confirmed', () => {
    // The replacement for `!=`. Documents that "no diagnoses yet" counts as
    // "excludes everything" — the same rule every unanswered key follows.
    assert.equal(run(`[$Diagnoses excludes ('RDN')]`, []), true);
    assert.equal(run(`[$Diagnoses excludes ('RDN')]`, [], { extra: [dxScreen({ key: 'RDN' })] }), false);
});

// -------------------------------------------- live answers vs saved entry

/**
 * A screen evaluates its own field conditions while the clinician is still
 * typing, so it hands parseCondition the values currently on screen. Those must
 * win over whatever that screen last saved.
 *
 * createBuildForm merges by screen id: an entry carrying the screen's id
 * REPLACES the saved one, an entry without an id is appended — and substitution
 * takes the first value it finds, so an appended entry loses. Getting this
 * wrong made chained conditions ($BSUnit depends on $BSmonYN, the readings
 * depend on $BSUnit) show and hide against stale answers.
 */
const SCREEN = 'blood-sugar';
const savedEntry = (monitor: string, unit: any) => [{
    screen: { id: SCREEN, type: 'form' },
    values: [{ key: 'BSmonYN', value: monitor }, { key: 'BSUnit', value: unit }],
}];
const onScreenNow = (monitor: string, unit: any) => [{ key: 'BSmonYN', value: monitor }, { key: 'BSUnit', value: unit }];

/** What the screen does: evaluate `condition` against the live values. */
const asScreen = (condition: string, saved: any[], live: any[]) => {
    const buildForm = createBuildForm({ entries: saved });
    return evaluateCompiled(compileCondition(condition, [{ screen: { id: SCREEN }, values: live }], { buildForm, configuration: null }));
};

test('live answers override the screen own saved entry', () => {
    const saved = savedEntry('Y', 'Mol');
    const live = onScreenNow('N', null);
    assert.equal(asScreen(`$BSmonYN = 'Y'`, saved, live), false, 'the unit field must hide once monitoring is set to No');
    assert.equal(asScreen(`$BSUnit = 'Mol'`, saved, live), false, 'and the reading field with it');
});

test('live answers are seen even when the saved entry had nothing', () => {
    const saved = savedEntry('N', null);
    const live = onScreenNow('Y', 'Mol');
    assert.equal(asScreen(`$BSmonYN = 'Y'`, saved, live), true);
    assert.equal(asScreen(`$BSUnit = 'Mol'`, saved, live), true);
});

test('switching between two option values re-evaluates both branches', () => {
    const saved = savedEntry('Y', 'Mol');
    const live = onScreenNow('Y', 'Mg');
    assert.equal(asScreen(`$BSUnit = 'Mol'`, saved, live), false, 'mmol field must hide');
    assert.equal(asScreen(`$BSUnit = 'Mg'`, saved, live), true, 'mg field must show');
});

test('an entry with no screen id is appended, and therefore loses', () => {
    // Pinned as the reason the screen must pass its id: this is the old,
    // broken behaviour, and it is a property of the merge rather than a bug
    // in the caller.
    const buildForm = createBuildForm({ entries: savedEntry('Y', 'Mol') });
    const stale = evaluateCompiled(compileCondition(`$BSmonYN = 'Y'`, [{ values: onScreenNow('N', null) }], { buildForm, configuration: null }));
    assert.equal(stale, true, 'without a screen id the saved answer still wins');
});

// ------------------------------------------------------------- hazards

test('a != chain joined by or is always true', () => {
    // Not a runtime bug — the expression is a tautology. Pinned so nobody
    // "fixes" the runtime to compensate for a content error.
    const ce = `$Outcome != 'BID' or $Outcome != 'DDA'`;
    assert.equal(run(ce, [{ key: 'Outcome', value: 'BID' }]), true);
    assert.equal(run(ce, [{ key: 'Outcome', value: 'DDA' }]), true);
    // the correct form
    const fixed = `$Outcome != 'BID' and $Outcome != 'DDA'`;
    assert.equal(run(fixed, [{ key: 'Outcome', value: 'BID' }]), false);
    assert.equal(run(fixed, [{ key: 'Outcome', value: 'LIV' }]), true);
});

test('a malformed expression is false, never a throw', () => {
    assert.equal(run(`$A = = = 'x'`, [{ key: 'A', value: 'x' }]), false);
    assert.equal(run(`((($A = 'x'`, [{ key: 'A', value: 'x' }]), false);
});

test('an empty expression compiles to something falsey, and callers guard it', () => {
    // "No condition" means "always show", but that is decided at the call site
    // (`if (!condition) return target`) — the pipeline is never handed one.
    // Pinned so nobody assumes the pipeline handles it.
    assert.equal(run('', []), false);
});

test('repeatable answers are addressable', () => {
    const answers: any[] = [{ key: 'repeatables', value: { grp: [{ f: { key: 'Dose', value: '5' } }] } }];
    assert.equal(run(`$repeatables.Dose = '5'`, answers), true);
});

if (failures.length) {
    console.error(`\n${failures.length} failed, ${passed} passed\n`);
    failures.forEach(f => console.error(`  ✗ ${f}`));
    process.exit(1);
}
console.log(`\n  ${passed} passed\n`);

/**
 * Cross-version safety: the editor and the app deploy independently.
 *
 * The web editor ships first and the app follows roughly a week later, so for
 * that week devices in the field run the PREVIOUS build while authors are
 * already editing with the new validation rules. The guarantee this file holds
 * is simple and it must not be weakened:
 *
 *   Content an author is FORCED to change by the new editor must behave
 *   identically on an old device to the content it replaced.
 *
 * "Identically" means the same screen shows or hides for the same patient. Not
 * "better" — identically. A device cannot be improved by a content edit; it can
 * only be broken by one.
 *
 * The old build is vendored verbatim in __fixtures__/legacy-pipeline.ts, so
 * this runs the real thing rather than a description of it.
 *
 *   node --experimental-strip-types src/utils/cross-version.test.ts
 */
import assert from 'node:assert/strict';

import { createLegacyRuntime } from './__fixtures__/legacy-pipeline';
import { compileCondition, createBuildForm } from './condition-pipeline';
import { buildOutcomeEntries } from './outcome-collections';

let passed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
    try { fn(); passed++; } catch (error: any) {
        failures.push(`${name}\n    ${error?.message?.split('\n')[0] || error}`);
    }
}

/** The new build's answer. */
function current(expression: string, entries: any[]): boolean {
    const buildForm = createBuildForm({ entries, outcomeEntries: buildOutcomeEntries(entries) });
    const compiled = compileCondition(expression, [], { buildForm, configuration: null });
    try { return !!eval(compiled); } catch { return false; }
}

/** A device still on the old build. */
function legacy(expression: string, entries: any[]): boolean {
    return createLegacyRuntime({ entries }).evaluate(expression);
}

// ---------------------------------------------------------------- fixtures

const obs = (over: Record<string, any> = {}) => ({
    screen: { id: 'obs', type: 'form' },
    values: Object.entries({
        DangerSigns: 'None', RR: 40, SatsO2: 98, WOB: 'None', AdmReason: 'Other',
        Colour: 'Norm', Activity: 'Alert', ...over,
    }).map(([key, value]) => ({ key, value })).concat(
        [{ key: 'NobCPAP', value: (over.NobCPAP ?? false) as any, dataType: 'boolean' } as any],
    ),
});

const dx = (...keys: string[]) => ({
    screen: { id: 'dx', type: 'diagnosis' },
    values: keys.map(k => ({ key: k, value: k, type: 'diagnosis', diagnosis: { how_agree: null } })),
});

const pb = (...keys: string[]) => ({
    screen: { id: 'pb', type: 'problems' },
    values: keys.map(k => ({ key: k, value: k, problem: { how_agree: null } })),
});

/** The answer states each pair is checked against. */
const STATES: { label: string; entries: any[] }[] = [
    { label: 'nothing notable', entries: [obs()] },
    { label: 'grunting', entries: [obs({ DangerSigns: 'Grun' })] },
    { label: 'tachypnoeic', entries: [obs({ RR: 80 })] },
    { label: 'low sats', entries: [obs({ SatsO2: 80 })] },
    { label: 'severe WOB', entries: [obs({ WOB: 'Sev' })] },
    { label: 'CPAP contraindicated', entries: [obs({ DangerSigns: 'Grun', NobCPAP: true })] },
    { label: 'RDN confirmed', entries: [obs(), dx('RDN')] },
    { label: 'PREMRDS confirmed', entries: [obs(), dx('PREMRDS')] },
    { label: 'several diagnoses', entries: [obs(), dx('SEPSIS', 'RDN')] },
    { label: 'unrelated diagnosis', entries: [obs(), dx('SEPSIS')] },
    { label: 'grunting + RDN', entries: [obs({ DangerSigns: 'Grun' }), dx('RDN')] },
    { label: 'problem confirmed', entries: [obs({ Colour: 'Yell' }), pb('Yell')] },
    { label: 'no outcome screens', entries: [obs({ Colour: 'Yell' })] },
];

/**
 * The real expressions the editor now rejects, each paired with the rewrite its
 * own quick fix produces. Taken from the live scripts; see the editor's
 * `npm run scan:ce-notation`.
 */
const MIGRATIONS: { what: string; before: string; after: string }[] = [
    {
        what: 'EMERGENCY MANAGEMENT (Neotree / Algorithm Function Test)',
        before: `($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or $Diagnoses = 'RDN' or $Diagnoses = 'PREMRDS') and $NobCPAP = false`,
        after: `($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or [$Diagnoses includes ('RDN')] or [$Diagnoses includes ('PREMRDS')]) and $NobCPAP = false`,
    },
    {
        what: 'EMERGENCY MANAGEMENT (Zambian Demo / Sally Mugabe)',
        before: `($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or $Diagnoses = 'RDN' or $AdmReason = 'PremRD') and $NobCPAP = false`,
        after: `($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or [$Diagnoses includes ('RDN')] or $AdmReason = 'PremRD') and $NobCPAP = false`,
    },
    {
        what: 'Jaundice with Kernicterus (SMCH Admission)',
        before: `($Colour = 'Yell' or $AdmReason = 'J' or $Problems = 'Yell') and ($Activity = 'Leth' or $Activity = 'Coma')`,
        after: `($Colour = 'Yell' or $AdmReason = 'J' or [$Problems includes ('Yell')]) and ($Activity = 'Leth' or $Activity = 'Coma')`,
    },
    {
        what: 'a collapsed multi-value rewrite, if an author writes one by hand',
        before: `($DangerSigns = 'Grun' or $Diagnoses = 'RDN' or $Diagnoses = 'PREMRDS') and $NobCPAP = false`,
        after: `($DangerSigns = 'Grun' or [$Diagnoses includes ('RDN','PREMRDS')]) and $NobCPAP = false`,
    },
];

// ------------------------------------------- the guarantee, on an old device

for (const { what, before, after } of MIGRATIONS) {
    test(`old build is unaffected by migrating: ${what}`, () => {
        for (const { label, entries } of STATES) {
            assert.equal(
                legacy(after, entries),
                legacy(before, entries),
                `on the OLD build, "${label}" changed when the CE was migrated — a device in the field would behave differently`,
            );
        }
    });
}

// --------------------------------------- and the new build is not regressed

for (const { what, before, after } of MIGRATIONS) {
    test(`new build agrees on both forms: ${what}`, () => {
        for (const { label, entries } of STATES) {
            assert.equal(
                current(after, entries),
                current(before, entries),
                `on the NEW build, "${label}" differs between the old and migrated wording`,
            );
        }
    });
}

// ------------------------------------------ what the fix is actually for

test('the new build is strictly better, never worse, than the old one', () => {
    // Every state where the two builds disagree must be one the old build got
    // wrong by hiding a screen — never one where the new build hides something
    // the old build showed.
    const regressions: string[] = [];
    for (const { what, after } of MIGRATIONS) {
        for (const { label, entries } of STATES) {
            const was = legacy(after, entries);
            const now = current(after, entries);
            if (was && !now) regressions.push(`${what} / ${label}: old showed it, new hides it`);
        }
    }
    assert.deepEqual(regressions, [], `the new build must never hide a screen the old build showed:\n  ${regressions.join('\n  ')}`);
});

/**
 * THE non-negotiable invariant under a rolling rollout.
 *
 * Sites run different builds for months, so the two must be ordered, not merely
 * different: an updated site may show a screen an un-updated one does not, but
 * it must NEVER hide one that an un-updated site shows. A clinician moving
 * between sites, or a site mid-upgrade, can then only gain prompts.
 *
 * This runs over every shape the editor permits, not just the expressions that
 * happen to be in the scripts today.
 */
const PERMITTED_SHAPES: string[] = [
    // ordinary comparisons — must be completely unaffected
    `$DangerSigns = 'Grun'`,
    `$DangerSigns != 'Grun'`,
    `$RR > 60`,
    `$SatsO2 < 90`,
    `$NobCPAP = false`,
    `$DangerSigns = 'Grun' and $NobCPAP = false`,
    `$DangerSigns = 'Grun' or $RR > 60`,
    `($DangerSigns = 'Grun' or $RR > 60) and $NobCPAP = false`,
    // the tautology that started the ticket — behaviour must not change
    `$DangerSigns != 'Grun' or $DangerSigns != 'None'`,
    // outcome collections, both operators
    `[$Diagnoses includes ('RDN')]`,
    `[$Diagnoses includes ('RDN','PREMRDS')]`,
    `[$Diagnoses excludes ('RDN')]`,
    `[$Problems includes ('Yell')]`,
    `[$Problems excludes ('Yell')]`,
    `$Diagnoses = 'RDN'`,
    // membership on an ordinary key — warned against, but must still be ordered
    `[$DangerSigns includes ('Grun')]`,
    `[$DangerSigns excludes ('Grun')]`,
    // combinations
    `($DangerSigns = 'Grun' or [$Diagnoses includes ('RDN')]) and $NobCPAP = false`,
    `[$Diagnoses excludes ('RDN')] and $NobCPAP = false`,
    // multi-line, implicitly ANDed
    `$NobCPAP = false\n[$Diagnoses includes ('RDN')]`,
];

test('an updated site never hides a screen an un-updated site shows', () => {
    const lost: string[] = [];
    for (const expression of PERMITTED_SHAPES) {
        for (const { label, entries } of STATES) {
            if (legacy(expression, entries) && !current(expression, entries)) {
                lost.push(`${JSON.stringify(expression)} / ${label}`);
            }
        }
    }
    assert.deepEqual(lost, [], `an updated site would hide these, which an un-updated site shows:\n  ${lost.join('\n  ')}`);
});

test('ordinary comparisons are byte-for-byte unaffected by the update', () => {
    // Anything without a new capability must answer identically on both builds,
    // in both directions — not merely ordered.
    const ordinary = PERMITTED_SHAPES.filter(e => !/includes|excludes|\$Diagnoses|\$Problems/i.test(e));
    assert.ok(ordinary.length >= 8, 'expected a decent sample of ordinary expressions');
    for (const expression of ordinary) {
        for (const { label, entries } of STATES) {
            assert.equal(
                current(expression, entries),
                legacy(expression, entries),
                `${JSON.stringify(expression)} differs at "${label}" — an ordinary comparison must not change`,
            );
        }
    }
});

test('the diagnosis route starts working, which is the point of the fix', () => {
    const { after } = MIGRATIONS[0];
    const quiet = [obs(), dx('RDN')];
    assert.equal(legacy(after, quiet), false, 'old build: diagnosis route dead');
    assert.equal(current(after, quiet), true, 'new build: diagnosis route live');
});

// ------------------------------- the one thing that WOULD break an old device

test('a NEW condition using membership is safe on an un-updated site', () => {
    // Membership returns false on the old runtime. For a condition that did not
    // exist before, that means an un-updated site simply does not fire it — it
    // shows less, never something wrong. This is why membership needs no
    // version gate: adding it can only ever withhold a screen, not misfire one.
    const grunting = [obs({ DangerSigns: 'Grun' })];
    assert.equal(legacy(`[$DangerSigns includes ('Grun')]`, grunting), false, 'old site: does not fire');
    assert.equal(current(`[$DangerSigns includes ('Grun')]`, grunting), true, 'updated site: fires');
    // and never the other way round
    assert.equal(legacy(`[$DangerSigns excludes ('Grun')]`, grunting), false);
});

test('REWRITING a working comparison into membership would cost an un-updated site a screen', () => {
    // This is the one unsafe edit, and the reason no editor quick fix ever
    // rewrites a working comparison into membership — see the ARRAY_COMPARISON
    // fix in the editor, which spells the replacement out in "=" / "or"
    // precisely so it stays evaluable everywhere.
    const grunting = [obs({ DangerSigns: 'Grun' })];
    const working = `$DangerSigns = 'Grun'`;
    const rewritten = `[$DangerSigns includes ('Grun')]`;

    assert.equal(legacy(working, grunting), true, 'the working form fires on an old site');
    assert.equal(legacy(rewritten, grunting), false, 'the rewrite does NOT — the site loses the screen');

    // The backward-compatible way to say the same thing, which the editor uses.
    const safeRewrite = `($DangerSigns = 'Grun')`;
    assert.equal(legacy(safeRewrite, grunting), true, 'an or-chain keeps working on an old site');
    assert.equal(current(safeRewrite, grunting), true, 'and on an updated one');
});

if (failures.length) {
    console.error(`\n${failures.length} failed, ${passed} passed\n`);
    failures.forEach(f => console.error(`  ✗ ${f}`));
    process.exit(1);
}
console.log(`\n  ${passed} passed (${MIGRATIONS.length} migrations x ${STATES.length} answer states)\n`);

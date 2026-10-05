/**
 * Compiling a conditional expression into an evaluable JavaScript string.
 *
 * This is the whole transformation the script context used to hold inline:
 * bracket groups, membership operators, key substitution, configuration keys,
 * and the final `and`/`or`/`=` rewrite. It is pure, so it can be tested against
 * real scripts without standing up React — which matters, because the previous
 * arrangement could only be tested by re-implementing it in the test, and a
 * re-implementation is exactly what silently drifted in the web editor's ops
 * page.
 *
 * Everything that needs React state stays in the context and reaches this
 * module through `buildForm`.
 *
 * The output is lowercased, so every comparison here is case-insensitive.
 */
import { resolveMemberships } from './membership';
import { referencesOutcomeCollection, NO_OUTCOME_ENTRIES } from './outcome-collections';

export interface CompileContext {
    /**
     * The substitution form for one line. Takes the line because whether the
     * outcome collections are worth assembling depends on what it references.
     * `extraEntries` are merged over the base by screen id.
     */
    buildForm: (line: string, extraEntries: any[]) => any[];
    configuration?: Record<string, any> | null;
}

export interface FormSources {
    /** Everything answered so far, one entry per screen. */
    entries: any[];
    /** Built by buildOutcomeEntries — $Diagnoses / $Problems. */
    outcomeEntries?: readonly any[];
    eligibilityAutoFillValues?: any[];
    nuidSearchForm?: { key: string; value: any }[];
}

/**
 * The form assembly, as a factory over plain data so the context and the tests
 * use the same one. `extraEntries` are merged over the base by screen id, which
 * is how a caller overrides what a screen answered.
 */
export function createBuildForm(sources: FormSources): CompileContext['buildForm'] {
    const {
        entries = [],
        outcomeEntries = NO_OUTCOME_ENTRIES,
        eligibilityAutoFillValues = [],
        nuidSearchForm = [],
    } = sources;

    const nuidEntries = nuidSearchForm.map(f => ({ value: [{ value: f.value, key: f.key }] }));

    return (line: string, extraEntries: any[]) => extraEntries.reduce((acc: any[], e: any) => {
        const index = !e?.screen?.id
            ? -1
            : acc.filter(x => x.screen).map(x => x.screen.id).indexOf(e.screen.id);

        if (index > -1) return acc.map((accEntry, i) => i === index ? { ...accEntry, ...e } : accEntry);

        return [...acc, e];
    }, [
        ...entries,
        // Only for lines that ask for them: each outcome costs a full
        // substitution pass, and almost no condition references these.
        ...(referencesOutcomeCollection(line) ? outcomeEntries : NO_OUTCOME_ENTRIES),
        { value: eligibilityAutoFillValues },
        ...nuidEntries,
    ]);
}

export function sanitizeCondition(condition: string): string {
    let sanitized = condition
        .replace(new RegExp(' and ', 'gi'), ' && ')
        .replace(new RegExp(' or ', 'gi'), ' || ')
        .replace(new RegExp(' = ', 'gi'), ' == ');
    // An unsubstituted $key becomes a string literal, so it compares unequal to
    // every real value rather than throwing ReferenceError.
    sanitized = sanitized.split(' ')
        .map(s => s[0] === '$' ? `'${s}'` : s).join(' ');
    return sanitized;
}

export function parseConditionString(condition: string, _key = '', value: any): string {
    const s = (condition || '').toLowerCase().split('$').join(' $');
    const key = (_key || '').toLowerCase();
    const parsed = s.replace(/\s\s+/g, ' ')
        .split(`$${key} =`).join(`${value} =`)
        .split(`$${key}=`).join(`${value} =`)
        .split(`$${key} >`).join(`${value} >`)
        .split(`$${key}>`).join(`${value} >`)
        .split(`$${key} <`).join(`${value} <`)
        .split(`$${key}<`).join(`${value} <`)
        .split(`$${key}!`).join(`${value} !`)
        .split(`$${key} !`).join(`${value} !`);
    return parsed;
}

/** Repeatable groups answer under `repeatables.<key>`. */
export function flattenRepeatables(values: any[]): any[] {
    const flat: any[] = [];

    values.forEach(v => {
        if (v?.key === 'repeatables' && typeof v.value === 'object') {
            const repeatables = v.value as Record<string, any[]>;

            Object.values(repeatables).forEach((repeatableGroup: any[]) => {
                repeatableGroup.forEach(entry => {
                    Object.entries(entry).forEach(([_, fieldValue]: [string, any]) => {
                        if (fieldValue && typeof fieldValue === 'object' && 'value' in fieldValue) {
                            flat.push({
                                ...fieldValue,
                                // Preserve the original key structure for repeatables
                                key: `${v.key}.${fieldValue.key}`,
                            });
                        }
                    });
                });
            });
        } else {
            flat.push(v);
        }
    });

    return flat;
}

function parseValue(condition = '', entryValue: any): string {
    const { calculateValue, type, inputKey, key, dataType } = entryValue;
    let value = entryValue.value;

    value = ((calculateValue === null) || (calculateValue === undefined)) ? value : calculateValue;
    value = ((value === null) || (value === undefined)) ? 'no value' : value;
    const t = dataType || type;

    switch (t) {
        case 'boolean':
            value = value === 'false' ? false : Boolean(value);
            break;
        default:
            if (key === 'createdAt') {
                value = value;
            } else {
                value = JSON.stringify(value);
            }
    }

    return parseConditionString(condition, inputKey || key, value);
}

/** Substitutes every answered key in `form` into the line. */
export function substituteForm(condition: string, form: any[]): string {
    return form.reduce((acc: string, entry: any) => {
        const { screen } = entry;
        let values: any[] = entry.value || entry.values || [];

        values = values.reduce((acc2: any[], v: any) => {
            acc2.push(v);
            if (v.value2 && v.key2) acc2.push({ value: v.value2, key: v.key2 });
            return acc2;
        }, []);

        values = values.filter(e => (e.value !== null) && (e.value !== undefined));
        values = flattenRepeatables(values);

        values = values.reduce((acc2: any[], e: any) => {
            acc2.push(...(e.value && Array.isArray(e.value) ? e.value : [e]));
            return acc2;
        }, []);

        // Make manual-entry text (value2) substitutable under the same key.
        // Exactly one clone per value, appended after all originals, with value2
        // stripped so clones can never be cloned again.
        const value2Substitutions = values
            .filter(v => v.value2)
            .map(v => ({ ...v, value: v.value2, value2: undefined }));

        if (value2Substitutions.length) values = values.concat(value2Substitutions);

        // Each parseValue pass is ~8 string split/joins over the whole condition;
        // once no $tokens remain there is nothing left to substitute, so skip the
        // remaining values. The first is always processed because parseValue also
        // normalizes the string even when it substitutes nothing.
        let c = values.reduce((acc2: string, v: any, i: number) => (
            (i > 0 && acc2.indexOf('$') === -1) ? acc2 : parseValue(acc2, v)
        ), acc);

        let chunks: string[] = values.filter(v => v.parentKey)
            .map(v => parseValue(acc, { ...v, key: v.parentKey }))
            .filter(x => x !== acc);

        if (screen) {
            switch (screen.type) {
                case 'multi_select':
                    // One substitution per selected value, OR'd — this is what
                    // makes `$Key = 'x'` true when any one selection is x.
                    chunks = values.map(v => parseValue(acc, v)).filter(x => x !== acc);
                    break;
                default:
                    // do nothing
            }
        }

        if (chunks.length) c = chunks.map(x => `(${x})`).join(' || ');

        return c || acc;
    }, condition);
}

export function applyConfiguration(condition: string, configuration?: Record<string, any> | null): string {
    if (!configuration) return condition;
    return Object.keys(configuration).reduce(
        (acc, key) => parseConditionString(acc, key, configuration[key] ? true : false),
        condition,
    );
}

/**
 * Compiles an expression to an evaluable string.
 *
 * Lines are independent and implicitly ANDed. A `[ ... ]` group is compiled on
 * its own against the same form, which is how the editor's bracket convention
 * is honoured.
 */
export function compileCondition(condition: string, extraEntries: any[], ctx: CompileContext): string {
    const compiled = `${condition || ''}`.split('\n').map(rawLine => {
        const form = ctx.buildForm(rawLine, extraEntries);

        let line = rawLine.replace(/\[(.*?)\]/gi, (_, group: string) => compileCondition(group, form, ctx));

        // Membership resolves to a literal before substitution, so it can share
        // a line with anything else.
        line = resolveMemberships(line, form);

        const substituted = applyConfiguration(substituteForm(line, form), ctx.configuration);

        return `(${sanitizeCondition(substituted)})`;
    }).join(' && ');

    return compiled.toLowerCase();
}

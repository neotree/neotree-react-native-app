/**
 * FROZEN SNAPSHOT of the conditional-expression runtime as it shipped BEFORE
 * NEOAPP-1514 — lifted verbatim from src/contexts/script/index.tsx at the
 * commit this work branched from.
 *
 * It exists for one reason: the web editor and the mobile app deploy
 * independently, and there is a window (currently about a week) where the
 * editor is updated but devices in the field are still running this code.
 * Content published during that window must behave the same on these devices
 * as it did before. cross-version.test.ts asserts exactly that.
 *
 * Do not "fix" anything in here. Its bugs are the point — this is what the old
 * build does, and the guarantee is about matching it, not improving it.
 *
 * Delete this file, and cross-version.test.ts with it, once the fixed app is
 * the minimum version in the field.
 */

// @ts-nocheck
/* eslint-disable */
// Type checking is off deliberately: this is a verbatim snapshot of shipped
// code, and it must not be edited to satisfy the current compiler.

export function createLegacyRuntime({
    entries = [] as any[],
    configuration = null as any,
    nuidSearchForm = [] as any[],
    eligibilityAutoFillValues = [] as any[],
} = {}) {
    function sanitizeCondition(condition: string): any {
        let sanitized = condition
            .replace(new RegExp(' and ', 'gi'), ' && ')
            .replace(new RegExp(' or ', 'gi'), ' || ')
            .replace(new RegExp(' = ', 'gi'), ' == ');
        sanitized = sanitized.split(' ')
            .map(s => s[0] === '$' ? `'${s}'` : s).join(' ');
        return sanitized;
    }

    function parseConditionString(condition = '', _key = '', value: any): any {
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

    function flattenRepeatables(values: any[]): any {
        const flat: types.ScreenEntryValue[] = [];
        
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
                                    key: `${v.key}.${fieldValue.key}`
                                } as types.ScreenEntryValue);
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

    function parseCondition(_condition = '', _entries: any[] = []): any {
        _condition = `${_condition || ''}`.split('\n').map(_condition => {
            const _form = _entries.reduce((acc, e) => {
                const index = !e?.screen?.id ? -1 : acc.filter(e => e.screen).map(e => e.screen.id).indexOf(e.screen.id);

                if (index > -1) {
                    return acc.map((accEntry, i) => {
                        if (i === index)  {
                            return { ...accEntry, ...e, }; 
                        } else { 
                            return accEntry;
                        }
                    }) as types.ScreenEntry[];
                }

                return [...acc, e] as types.ScreenEntry[];
            }, [
                ...entries,
                {
                    value: eligibilityAutoFillValues,
                } as types.ScreenEntry,
                ...nuidSearchForm.map(f => {
                    const entry = {
                        value: [{
                            value: f.value,
                            key: f.key,
                        }],
                    } as types.ScreenEntry;
                    
                    return entry;
                }),
            ]);

            _condition = _condition.replace(/\[(.*?)\]/gi, (_, match: string) => {
                return parseCondition(match, _form);
            });

            if (
                _condition.match(/ excludes /gi) ||
                _condition.match(/ includes /gi) ||
                _condition.match(/ or_excludes /gi) ||
                _condition.match(/ or_includes /gi)
            ) {
                let joinWith = 'and';
                if (_condition.match(/ or_excludes /gi) || _condition.match(/ or_includes /gi)) {
                    joinWith = 'or';
                    _condition = _condition.replaceAll(' or_excludes ', ' excludes ');
                    _condition = _condition.replaceAll(' or_includes ', ' includes ');
                }

                const [key, vals] = _condition.match(/ excludes /gi) ?
                    _condition.split(/ excludes /gi).map(s => s.trim())
                    :
                    _condition.split(/ includes /gi).map(s => s.trim());

                const valsParsed = (vals || '')
                    .replace(/\((.*?)\)/gi, '$1').trim().split(',')
                    .map(s => s.trim().replace(/\'(.*?)\'/gi, '$1'))
                    .map(s => s.trim().replace(/\"(.*?)\"/gi, '$1'))
                    .map(s => s.trim().replace(/\`(.*?)\`/gi, '$1'));

                // const valsParsed = `${vals || ''}`
                //     .replace(/\((.*?)\)/, '$1')
                //     .split(',')
                //     .map(v => v.trim().replaceAll('"', '').replaceAll("'", '').replaceAll('`', '').replaceAll('`', ''));

                const entryVals = _form.map(e => {
                    let found: string[] = [];
                    const entryVals = e.value || e.values || [];
                    entryVals.forEach(v => {
                        if (`$${v?.key?.toLowerCase?.()}` === key?.toLowerCase?.()) {
                            const val = Array.isArray(v.value) ? v.value : [v.value];
                            val.forEach(v => {
                                if (v.key) {
                                    found.push(v.key);
                                }
                            });
                        }
                    });
                    return found.filter(v => v);
                }).reduce((acc, arr) => [...acc, ...arr], []);

                _condition = valsParsed
                    .map(v => {
                        // let includes = entryVals.map(v => v.toLowerCase()).includes(v.toLowerCase());
                        // if (_condition.match(/ excludes /gi)) {
                        //     includes = !includes;
                        // }
                        // return includes;
                        return `${JSON.stringify(entryVals.map(v => v.toLowerCase()))}.includes(${JSON.stringify(v).toLowerCase()})`;
                    })
                    .join(` ${joinWith} `);

                return _condition;
            }

            const parseValue = (condition = '', { value, calculateValue, type, inputKey, key, dataType }: types.ScreenEntryValue) => {
                value = ((calculateValue === null) || (calculateValue === undefined)) ? value : calculateValue;
                value = ((value === null) || (value === undefined)) ? 'no value' : value;
                const t = dataType || type;
        
                switch (t) {
                    case 'boolean':
                        value = value === 'false' ? false : Boolean(value);
                        break;
                    default:
                        if(key==='createdAt'){
                            value=value
                        }else{
                            value = JSON.stringify(value)
                        }
                }
        
                return parseConditionString(condition, inputKey || key, value);
            };
        
            let parsedCondition = _form.reduce((condition: string, { screen, values, value }: types.ScreenEntry) => {
                values = value || values || [];

                values = values.reduce((acc: typeof values, v) => {
                    acc.push(v);
                    if (v.value2 && v.key2) acc.push({ value: v.value2, key: v.key2, });
                    return acc;
                }, []);
                
                // First filter out null/undefined values
                values = values.filter(e => (e.value !== null) && (e.value !== undefined));
                
                // Flatten repeatable structures if they exist
                values = flattenRepeatables(values);
                
                // Handle both array and non-array values
                values = values
                    .reduce((acc: types.ScreenEntryValue[], e) => {
                        acc.push(...(e.value && Array.isArray(e.value) ? e.value : [e]));
                        return acc;
                    }, []);

                // Make manual-entry text (value2) substitutable under the same key.
                // Exactly one clone per value, appended after all originals, with
                // value2 stripped so clones can never be cloned again. (The previous
                // in-loop acc.forEach re-cloned every prior clone on each iteration,
                // doubling them per value — exponential once any value2 was set.)
                const value2Substitutions = values
                    .filter(v => v.value2)
                    .map(v => ({ ...v, value: v.value2, value2: undefined }));

                if (value2Substitutions.length) {
                    values = values.concat(value2Substitutions);
                }

                // Each parseValue pass is ~8 string split/joins over the whole
                // condition; once no $tokens remain there is nothing left to
                // substitute, so skip the remaining values. The first value is
                // always processed because parseValue also normalizes the string
                // (lowercase/spacing) even when it substitutes nothing.
                let c = values.reduce((acc, v, i) => (
                    (i > 0 && acc.indexOf('$') === -1) ? acc : parseValue(acc, v)
                ), condition);

                let chunks: string[] = values.filter(v => v.parentKey)
                    .map(v => parseValue(condition, {
                        ...v,
                        key: v.parentKey,
                    }))
                    .filter(c => c !== condition);
        
                if (screen) {
                    switch (screen.type) {
                        case 'multi_select':
                            chunks = values.map(v => parseValue(condition, v)).filter(c => c !== condition);
                            break;
                        default:
                        // do nothing
                    }
                }

                if (chunks.length) {
                    c = chunks.map(c => `(${c})`).join(' || ');
                }
        
                return c || condition;
            }, _condition);
        
            if (configuration) {
                parsedCondition = Object.keys(configuration).reduce((acc, key) => {
                    return parseConditionString(acc, key, configuration[key] ? true : false);
                }, parsedCondition);
            }
        
            return `(${sanitizeCondition(parsedCondition)})`;
        }).join(' && ');

        return _condition.toLowerCase();
    }

    function evaluateCondition(condition: string, defaultEval = false): boolean {
        try { return !!eval(condition); } catch { return defaultEval; }
    }

    /** What a device on the old build decides for this expression. */
    function evaluate(expression: string): boolean {
        return evaluateCondition(parseCondition(expression, []));
    }

    return { parseCondition, evaluate };
}

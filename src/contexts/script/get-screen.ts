import * as types from '@/src/types';
import { ScriptContextType } from './index';

type EvaluateDrugsScreenParams = {
    entries: types.ScreenEntry[];
    drugsLibrary: types.DrugsLibraryItem[];
    screen: any;
    evaluateCondition: (condition: string) => boolean;
};

function evaluateDrugsScreen({
    entries,
    screen,
    drugsLibrary,
    evaluateCondition
}: EvaluateDrugsScreenParams) {
    'worklet';

    const metadata = { ...screen.data?.metadata, };
    const screenDrugs = (metadata.drugs || []) as types.DrugField[];

    const drugs = drugsLibrary
        .filter(item => item.type === 'drug')
        .map(d => {
            const screenDrugIndex = screenDrugs.map(d => `${d.key}`.toLowerCase()).indexOf(`${d.key}`.toLowerCase());
            const screenDrug = screenDrugs[screenDrugIndex];
            if (screenDrug) {
                return {
                    ...d,
                    position: screenDrugIndex,
                };
            }
            return null!;
        })
        .filter(d => d)
        .sort((a, b) => a.position - b.position)
        .map(d => {
            const weightKeys = `${d.weightKey}`.toLowerCase().split(',').map(key => key.trim());
            const condition = `${d.condition || ''}`;
            const diagnosisKeys = `${d.diagnosisKey || ''}`.split(',');
            const ageKeys = `${d.ageKey}`.toLowerCase().split(',').map(key => key.trim());
            const gestationKey = `${d.gestationKey}`.toLowerCase();

            let conditionMet = !condition ? true : false;

            const entriesKeyVal: { [key: string]: any[]; } = {};
            const diagnoses: string[] = [];

            entries.forEach(e => {
                const values = [
                    ...(e.value || []),
                    ...(e.values || []),
                ];

                values.forEach(v => {
                    if (v.key) {
                        let key = `${v.key}`.toLowerCase();

                        let value = !v.value ? [] : v.value?.map ? v.value : [v.value];
                        if ((v.calculateValue !== undefined) && (v.calculateValue !== null)) value = [v.calculateValue];
                        if (v.diagnosis?.key) {
                            diagnoses.push(v.diagnosis.key);
                            value = [v.diagnosis.key];
                        }
                        if (condition) {
                            conditionMet = evaluateCondition(condition);
                        }
                        entriesKeyVal[key] = value;
                    }
                });
            });

            const weights = weightKeys.map(key => (entriesKeyVal[key] || [])[0])
                .filter(n => (n !== undefined) || (n !== null) || (n !== ''))
                .map(n => Number(n))
                .filter(n => !isNaN(n));

            const weight: number | null = !weights.length ? null : Math.max(...weights);
            // let weight: number | null = (entriesKeyVal[weightKey] || [])[0];
            // weight = weight === null ? null : (isNaN(Number(weight)) ? null : Number(weight));

            const ages = ageKeys.map(key => (entriesKeyVal[key] || [])[0])
                .filter(n => (n !== undefined) || (n !== null) || (n !== ''))
                .map(n => Number(n))
                .filter(n => !isNaN(n));

            const age: number | null = !ages.length ? null : Math.max(...ages);
            // let age: number | null = (entriesKeyVal[ageKey] || [])[0];
            // age = age === null ? null : (isNaN(Number(age)) ? null : Number(age));

            let gestation: number | null = (entriesKeyVal[gestationKey] || [])[0];
            gestation = gestation === null ? null : (isNaN(Number(gestation)) ? null : Number(gestation));

            const matchedDiagnoses = diagnosisKeys.filter(key => 
                diagnoses.map(d => d.toLowerCase()).includes(key.toLowerCase()));

            return {
                ...d,
                weight,
                gestation,
                diagnoses: matchedDiagnoses,
                age,
                conditionMet,
            };
        })
        .filter(d => {
            if (d.validationType === 'condition') {
                return d.conditionMet && (!d.diagnosisKey ? true : !!d.diagnoses.length);
            }

            if (
                (d.weight === null) ||
                (d.gestation === null) ||
                (d.age === null) ||
                !d.diagnoses.length ||
                !d.conditionMet
            ) return false;

            const isCorrectWeight = (d.weight >= d.minWeight!) && (d.weight <= d.maxWeight!);
            const isCorrectAge = (d.age >= d.minAge!) && (d.age <= d.maxAge!);
            const isCorrectGestation = (d.gestation >= d.minGestation!) && (d.gestation <= d.maxGestation!);
            
            return (
                isCorrectWeight &&
                isCorrectAge &&
                isCorrectGestation
            );
        }).map(d => {
            let dosage = 0;
            const dosageMultiplier = d.dosageMultiplier || 1;
            
            if (d.dosage) {
                if (d.validationType === 'condition') {
                    dosage = Number((d.dosage * dosageMultiplier).toFixed(2));
                } else {
                    dosage = d.dosage! * dosageMultiplier!;
                    if (d.weight !== null) dosage = dosage * d.weight!

                    dosage = isNaN(dosage) ? dosage : Math.round(dosage);
                }
            }

            return {
                ...d,
                dosage,
            };
        });

    metadata.drugs = drugs
        .filter((d, i) => drugs.map(d => d.key).indexOf(d.key) === i); // remove duplicates

    return {
        ...screen,
        data: {
            ...screen.data,
            metadata,
        },
    };
}

function evaluateFluidsScreen({
    entries,
    screen,
    drugsLibrary,
    evaluateCondition,
}: EvaluateDrugsScreenParams) {
    'worklet';

    const metadata = { ...screen.data?.metadata, };
    const screenFluids = (metadata.fluids || []) as types.DrugField[];

    const fluids = drugsLibrary
        .filter(item => item.type === 'fluid')
        .map(d => {
            const screenDrugIndex = screenFluids.map(d => `${d.key}`.toLowerCase()).indexOf(`${d.key}`.toLowerCase());
            const screenDrug = screenFluids[screenDrugIndex];
            if (screenDrug) {
                return {
                    ...d,
                    position: screenDrugIndex,
                };
            }
            return null!;
        })
        .filter(d => d)
        .sort((a, b) => a.position - b.position)
        .map(d => {
            const weightKeys = `${d.weightKey}`.toLowerCase().split(',').map(key => key.trim());
            const condition = `${d.condition || ''}`;
            const ageKeys = `${d.ageKey}`.toLowerCase().split(',').map(key => key.trim());
            const gestationKey = `${d.gestationKey}`.toLowerCase();

            let conditionMet = !condition ? true : false;

            const entriesKeyVal: { [key: string]: any[]; } = {};

            entries.forEach(e => {
                const values = [
                    ...(e.value || []),
                    ...(e.values || []),
                ];

                values.forEach(v => {
                    if (v.key) {
                        let key = `${v.key}`.toLowerCase();

                        let value = !v.value ? [] : v.value?.map ? v.value : [v.value];
                        if ((v.calculateValue !== undefined) && (v.calculateValue !== null)) value = [v.calculateValue];
                        if (condition) {
                            conditionMet = evaluateCondition(condition);
                        }
                        entriesKeyVal[key] = value;
                    }
                });
            });

            const weights = weightKeys.map(key => (entriesKeyVal[key] || [])[0])
                .filter(n => (n !== undefined) || (n !== null) || (n !== ''))
                .map(n => Number(n))
                .filter(n => !isNaN(n));

            const weight: number | null = !weights.length ? null : Math.max(...weights);
            // let weight: number | null = (entriesKeyVal[weightKey] || [])[0];
            // weight = weight === null ? null : (isNaN(Number(weight)) ? null : Number(weight));

            const ages = ageKeys.map(key => (entriesKeyVal[key] || [])[0])
                .filter(n => (n !== undefined) || (n !== null) || (n !== ''))
                .map(n => Number(n))
                .filter(n => !isNaN(n));

            const age: number | null = !ages.length ? null : Math.max(...ages);
            // let age: number | null = (entriesKeyVal[ageKey] || [])[0];
            // age = age === null ? null : (isNaN(Number(age)) ? null : Number(age));

            let gestation: number | null = (entriesKeyVal[gestationKey] || [])[0];
            gestation = gestation === null ? null : (isNaN(Number(gestation)) ? null : Number(gestation));

            return {
                ...d,
                weight,
                gestation,
                age,
                conditionMet,
            };
        })
        .filter(d => {
            if (d.validationType === 'condition') return d.conditionMet;

            if (
                (d.weight === null) ||
                (d.gestation === null) ||
                (d.age === null) ||
                !d.conditionMet
            ) return false;

            const isCorrectWeight = (d.weight >= d.minWeight!) && (d.weight <= d.maxWeight!);
            const isCorrectAge = (d.age >= d.minAge!) && (d.age <= d.maxAge!);
            const isCorrectGestation = (d.gestation >= d.minGestation!) && (d.gestation <= d.maxGestation!);
            
            return (
                isCorrectWeight &&
                isCorrectAge &&
                isCorrectGestation
            );
        }).map(d => {
            let dosage = 0;
            let hourlyDosage = 0;
            const dosageMultiplier = d.dosageMultiplier || 1;
            const hourlyFeedDivider = d.hourlyFeedDivider || 1;

            if (d.dosage) {
                if (d.validationType === 'condition') {
                    dosage = Number((d.dosage * dosageMultiplier).toFixed(2));
                } else {
                    dosage = d.dosage! * dosageMultiplier!;
                    if (d.weight !== null) dosage = dosage * d.weight!

                    dosage = isNaN(dosage) ? dosage : Math.round(dosage);
                }

                hourlyDosage = dosage / hourlyFeedDivider;
                hourlyDosage = isNaN(hourlyDosage) ? hourlyDosage : Math.round(hourlyDosage);
            }

            return {
                ...d,
                dosage,
                hourlyDosage,
            };
        });

    metadata.fluids = fluids
        .filter((d, i) => fluids.map(d => d.key).indexOf(d.key) === i); // remove duplicates

    return {
        ...screen,
        data: {
            ...screen.data,
            metadata,
        },
    };
}

export function getScreen(
    { 
        ctx, 
        ...opts 
    }: {
        ctx: ScriptContextType;
        direction?: 'next' | 'back', 
        index?: number;
    }, 
    cb: (
        screen: {
            screen: types.Screen;
            index: number;
        } | null
    ) => void
) {
    'worklet';

    if (!ctx) return;

    const {
        entries, 
        activeScreen, 
        activeScreenEntry, 
        activeScreenIndex, 
        drugsLibrary, 
        screens,
        configuration,
    } = ctx;

    const evaluateCondition = (condition: string, defaultEval = false) => {
        let conditionMet = defaultEval;
        try {
            conditionMet = eval(condition);
        } catch (e) {
            // do nothing
        }
        return conditionMet;
    };
    
    const sanitizeCondition = (condition: string) => {
        let sanitized = condition
            .replace(new RegExp(' and ', 'gi'), ' && ')
            .replace(new RegExp(' or ', 'gi'), ' || ')
            .replace(new RegExp(' = ', 'gi'), ' == ');
        sanitized = sanitized.split(' ')
            .map(s => s[0] === '$' ? `'${s}'` : s).join(' ');
        return sanitized;
    };

    const parseConditionString = (condition: string, _key = '', value: any) => {
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
    };

    const flattenRepeatables = (values: any[]): types.ScreenEntryValue[] => {
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
    };

    const parseCondition = (
        _condition = '', 
        _entries: ({ values: types.ScreenEntry['values'], screen?: types.ScreenEntry['screen'] })[] = []
    ) => {
        _condition = (_condition || '').toString();
    
        const _form = _entries.reduce((acc, e) => {
            const index = !e.screen ? -1 : acc.map(e => e.screen.id).indexOf(e.screen.id);
            if (index > -1) return acc.map((_e, i) => i === index ? { ..._e, ...e } : _e) as types.ScreenEntry[];
            return [...acc, e] as types.ScreenEntry[];
        }, entries);
    
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
                ;
            }
    
            return parseConditionString(condition, inputKey || key, value);
        };
    
        let parsedCondition = _form.reduce((condition: string, { screen, values, value }: types.ScreenEntry) => {
            values = value || values || [];
            
            // First filter out null/undefined values
            values = values.filter(e => (e.value !== null) && (e.value !== undefined));
            
            // Flatten repeatable structures if they exist
            values = flattenRepeatables(values);
            
            // Handle both array and non-array values
            values = values.reduce((acc: types.ScreenEntryValue[], e) => [
                ...acc,
                ...(e.value && Array.isArray(e.value) ? e.value : [e]),
            ], []);
    
            let c = values.reduce((acc, v) => parseValue(acc, v), condition);
    
            if (screen) {
                let chunks = [];
                switch (screen.type) {
                    case 'multi_select':
                        chunks = values.map(v => parseValue(condition, v)).filter(c => c !== condition);
                        c = (chunks.length > 1 ? chunks.map(c => `(${c})`) : chunks).join(' || ');
                        break;
                    default:
                    // do nothing
                }
            }
    
            return c || condition;
        }, _condition);
    
        if (configuration) {
            parsedCondition = Object.keys(configuration).reduce((acc, key) => {
                return parseConditionString(acc, key, configuration[key] ? true : false);
            }, parsedCondition);
        }
    
        return sanitizeCondition(parsedCondition);
    };

    const { index: i, direction: d } = { ...opts };
    const direction = (d && ['next', 'back'].includes(d)) ? d : null;
    
    if ((i !== undefined) && !isNaN(Number(i))) cb?.(screens[i] ? { screen: screens[i], index: i } : null);

    let skipToScreenIndex: number | null = null;
    
    const getTargetScreen = (i = activeScreenIndex): null | { screen: types.Screen, index: number; } => {
        let index = (() => {
            switch (direction) {
                case 'next':
                    if (activeScreen?.data?.skipToScreenId) {
                        skipToScreenIndex = screens.map((s, i) => {
                            if (
                                (s.screen_id === activeScreen?.data?.skipToScreenId) ||
                                (s.screenId === activeScreen?.data?.skipToScreenId)
                            ) return i;
                            return null;
                        }).filter(i => i !== null)[0] || null;
                    }
                    return i + 1;
                case 'back':
                    const prevEntry = entries[activeScreenEntry ? entries.length - 2 : entries.length - 1];
                    const index = screens.map((s, i) => {
                        if (
                            (s.screen_id === prevEntry?.screen?.screen_id) ||
                            (s.screenId === prevEntry?.screen?.screen_id)
                        ) return i;
                        return null;
                    }).filter(i => i !== null)[0]; 
                    return index === null ? (i - 1) : index;
                default:
                    return i;
            }
        })();

        if (activeScreen?.data?.skipToCondition && (skipToScreenIndex !== null) && (skipToScreenIndex > activeScreenIndex)) {
            const parsedCondition = parseCondition(`${activeScreen?.data?.skipToCondition || ''}`);
            index = evaluateCondition(parsedCondition) ? skipToScreenIndex : index;
        }
    
        let screen = screens[index];

        if (screen?.type === 'drugs') {
            const s = evaluateDrugsScreen({
                entries: entries,
                drugsLibrary,
                screen,
                evaluateCondition: (condition) => evaluateCondition(parseCondition(condition)),
            });

            screen = s;

            if (!s.data?.metadata?.drugs?.length) {
                const res = getTargetScreen(index);
                if (res) {
                    screen = res?.screen;
                    index = res?.index;
                } else {
                    screen = null;
                }
            }
        }

        if (screen?.type === 'fluids') {
            const s = evaluateFluidsScreen({
                entries: entries,
                drugsLibrary,
                screen,
                evaluateCondition: (condition) => evaluateCondition(parseCondition(condition)),
            });

            screen = s;

            if (!s.data?.metadata?.fluids?.length) {
                const res = getTargetScreen(index);
                if (res) {
                    screen = res?.screen;
                    index = res?.index;
                } else {
                    screen = null;
                }
            }
        }
        
        if (!screen) return null;
    
        if (!direction) return { screen, index, };
    
        const target = { screen, index };
        const condition: string = screen.data.condition || '';
    
        if (!condition) return target;

        const parsedCondition = parseCondition(condition);
        let conditionMet = evaluateCondition(parsedCondition);

        const conditionSplit = condition.split('\n').map(c => c.trim()).filter(c => c);

        if (conditionSplit.length > 1) {
            conditionMet = true;
            conditionSplit.forEach(c => {
                const parsedCondition = parseCondition(c);
                const isTrue = evaluateCondition(parsedCondition);
                if (!isTrue) conditionMet = false;
            });
        }

        if (conditionMet) return target;
        
        if (index === (screens.length - 1)) return null;
    
        return getTargetScreen(index);
    };
    
    const s = getTargetScreen();

    cb?.(s);
}

import * as types from '@/src/types';
import { evaluateDrugsScreen } from '@/src/utils/evaluate-drugs-screen';
import { evaluateFluidsScreen } from '@/src/utils/evaluate-fluids-screen';

export const evaluateCondition = (condition: string, defaultEval = false) => {
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

type UtilsParams = {
	script_id: string | number;
    script: types.Script;
    activeScreen: types.Screen;
    activeScreenIndex: number;
    screens: types.Screen[];
    diagnoses: types.Diagnosis[];
    entries: types.ScreenEntry[];
    cachedEntries: types.ScreenEntry[];
    activeScreenEntry?: types.ScreenEntry;
    configuration: types.Configuration;
    application?: null | types.Application;
    location: null | types.Location;
    startTime: string;
    matchingSession: any;
	session?: any;
    generatedUID: string;
    drugsLibrary: types.DrugsLibraryItem[];
};
  
export const getScriptUtils = ({
	script_id,
    script,
    activeScreen,
    activeScreenIndex,
    activeScreenEntry,
    screens,
    diagnoses,
    entries: form,
    // cachedEntries,
    configuration,
    application,
    location,
    startTime,
    matchingSession,
	session,
    generatedUID,
    drugsLibrary,
}: UtilsParams) => {
    const matches: any[] = [];

    // function parseCondition(
    //     _condition = '',
    //     entries: ({ values: types.ScreenEntry['values'], screen?: types.ScreenEntry['screen'] })[] = []
    //   ) {
    //     _condition = (_condition || '').toString();
      
    //     const _form = entries.reduce((acc, e) => {
    //       const index = !e.screen ? -1 : acc.map(e => e.screen?.id).indexOf(e.screen?.id);
    //       if (index > -1) return acc.map((_e, i) => (i === index ? { ..._e, ...e } : _e)) as types.ScreenEntry[];
    //       return [...acc, e] as types.ScreenEntry[];
    //     }, [] as types.ScreenEntry[]);
      
    //     const flattenRepeatables = (values: any[]): types.ScreenEntryValue[] => {
    //         const flat: types.ScreenEntryValue[] = [];
          
    //         values.forEach(v => {
    //           if (v?.key === 'repeatables' && typeof v.value === 'object') {
    //             const repeatables = v.value as Record<string, any[]>;
    //             Object.values(repeatables).forEach((repeatableGroup: any[]) => {
    //               repeatableGroup.forEach(entry => {
    //                 Object.entries(entry).forEach(([_, fieldValue]: [string, any]) => {
    //                   if (fieldValue && typeof fieldValue === 'object' && 'value' in fieldValue) {
    //                     flat.push(fieldValue as types.ScreenEntryValue);
    //                   }
    //                 });
    //               });
    //             });
    //           } else {
    //             flat.push(v);
    //           }
    //         });
          
    //         return flat;
    //       };
             
    //     const parseValue = (
    //       condition = '',
    //       { value, calculateValue, type, inputKey, key, dataType }: types.ScreenEntryValue
    //     ) => {
    //       value = (calculateValue === null || calculateValue === undefined) ? value : calculateValue;
    //       value = (value === null || value === undefined) ? 'no value' : value;
      
    //       const t = dataType || type;
    //       switch (t) {
    //         case 'boolean':
    //           value = value === 'false' ? false : Boolean(value);
    //           break;
    //         default:
    //           value = JSON.stringify(value);
    //       }
      
    //       return parseConditionString(condition, inputKey || key, value);
    //     };
      
    //     let parsedCondition = _form.reduce((condition: string, { screen, values, value }: types.ScreenEntry) => {
    //       values = value || values || [];
      
    //       // Flatten values including repeatables
    //       const flatValues = flattenRepeatables(values).filter(v => v?.value !== null && v?.value !== undefined);
      
    //       let c = flatValues.reduce((acc, v) => parseValue(acc, v), condition);
      
    //       if (screen) {
    //         let chunks = [];
    //         switch (screen.type) {
    //           case 'multi_select':
    //             chunks = flatValues.map(v => parseValue(condition, v)).filter(c => c !== condition);
    //             c = (chunks.length > 1 ? chunks.map(c => `(${c})`) : chunks).join(' || ');
    //             break;
    //           default:
    //           // No extra handling needed for other screen types
    //         }
    //       }
      
    //       return c || condition;
    //     }, _condition);
      
    //     if (typeof configuration !== 'undefined') {
    //       parsedCondition = Object.keys(configuration).reduce((acc, key) => {
    //         return parseConditionString(acc, key, !!configuration[key]);
    //       }, parsedCondition);
    //     }
      
    //     return sanitizeCondition(parsedCondition);
    //   }
      
    function parseCondition(_condition = '', entries: ({ values: types.ScreenEntry['values'], screen?: types.ScreenEntry['screen'] })[] = []) {    
        _condition = (_condition || '').toString();
    
        const _form = entries.reduce((acc, e) => {
            const index = !e.screen ? -1 : acc.map(e => e.screen.id).indexOf(e.screen.id);
            if (index > -1) return acc.map((_e, i) => i === index ? { ..._e, ...e } : _e) as types.ScreenEntry[];
            return [...acc, e] as types.ScreenEntry[];
        }, form);
    
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

            const keyValueMap = values.reduce((acc, v) => {
                const key = v.key || v.inputKey;

                if (key) {
                    acc[key] = v.calculateValue || v.value || 'no value'; 

                    const t = v.dataType || v.type;
    
                    switch (t) {
                        case 'boolean':
                            acc[key] = `${acc[key]}` === 'false' ? false : Boolean(value);
                            break;

                        default:
                            acc[key] = JSON.stringify(acc[key]);
                    }
                }
                
                return acc;
            }, {} as Record<string, any>);

            let _cond = condition;

            Object.keys(keyValueMap).forEach(key => {
                _cond = parseConditionString(_cond, key, keyValueMap[key]);
            });

            _cond = sanitizeCondition(_cond);

            console.log(_cond);
    
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
    }
    
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


    function getScreen(opts?: { direction?: 'next' | 'back', index?: number; }) {
        const { index: i, direction: d } = { ...opts };
        const direction = (d && ['next', 'back'].includes(d)) ? d : null;
        
        if ((i !== undefined) && !isNaN(Number(i))) return screens[i] ? { screen: screens[i], index: i } : null;

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
                        const prevEntry = form[activeScreenEntry ? form.length - 2 : form.length - 1];
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
                    entries: form,
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
                    entries: form,
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
        
        return getTargetScreen();
    };
    
    function getLastScreen() {
        if (!activeScreen) return null;
    
        const getScreenIndex = (s: types.Screen) => !s ? -1 : screens.map(s => s.id).indexOf(s.id);
        const activeScreenIndex = getScreenIndex(activeScreen);
    
        const getLastScreen = (currentIndex: number): null | types.Screen => {    
            let lastScreenIndex = currentIndex + 1;
            let lastScreen = lastScreenIndex >= screens.length ? null : screens[lastScreenIndex];

            if (lastScreen?.type === 'drugs') {
                const s = evaluateDrugsScreen({
                    entries: form,
                    drugsLibrary,
                    screen: lastScreen,
                    evaluateCondition: (condition) => evaluateCondition(parseCondition(condition)),
                });

                lastScreen = s;
    
                if (!s.data?.metadata?.drugs?.length) {
                    lastScreen = getLastScreen(lastScreenIndex);
                }
            }

            if (lastScreen?.type === 'fluids') {
                const s = evaluateFluidsScreen({
                    entries: form,
                    drugsLibrary,
                    screen: lastScreen,
                    evaluateCondition: (condition) => evaluateCondition(parseCondition(condition)),
                });

                lastScreen = s;
    
                if (!s.data?.metadata?.fluids?.length) {
                    lastScreen = getLastScreen(lastScreenIndex);
                }
            }

            const condition: string = lastScreen?.data?.condition || '';
            const conditionSplit = condition.split('\n').map(c => c.trim()).filter(c => c);
    
            if (condition) {
                const parsedCondition = parseCondition(condition, form.filter(e => e.screen.id !== lastScreen.id));
                let conditionMet = evaluateCondition(parsedCondition);

                if (conditionSplit.length > 1) {
                    conditionMet = true;
                    conditionSplit.forEach(c => {
                        const parsedCondition = parseCondition(c);
                        const isTrue = evaluateCondition(parsedCondition);
                        if (!isTrue) conditionMet = false;
                    });
                }

                if (!conditionMet) {
                    lastScreenIndex = lastScreenIndex + 1;
                    lastScreen = lastScreenIndex >= screens.length ? null : getLastScreen(lastScreenIndex);
                }
            }

            return lastScreen;
        };
    
        return getLastScreen(activeScreenIndex) || activeScreen;
    }

    function getSuggestedDiagnoses() {
        diagnoses = diagnoses.reduce((acc: types.Diagnosis[], d) => {
            if (acc.map(d => d.diagnosis_id).includes(d.diagnosis_id)) return acc;
            return [...acc, d];
        }, []);

        diagnoses = [
            ...diagnoses.filter(d => d.data.severity_order || (d.data.severity_order === 0))
                .sort((a, b) => a.data.severity_order - b.data.severity_order),
            ...diagnoses.filter(d => (d.data.severity_order === null) || (d.data.severity_order === undefined) || (d.data.severity_order === '')),
        ]
            .map((d, position) => {
                let sevOrder = d.data.severity_order || (d.data.severity_order === 0) ? Number(d.data.severity_order) : null;
                if (isNaN(Number(sevOrder))) sevOrder = null;

                return { 
                    ...d, 
                    position, 
                    severity_order: sevOrder,
                };
            });
        
        const diagnosesRslts = (() => {
            const rslts = (diagnoses || []).filter(({ data: { symptoms, expression } }) => {
                return expression || (symptoms || []).length;
            }).map((d, i) => {
                const { data: { symptoms: s, expression } } = d;
                const symptoms: any[] = s || [];
            
                const _symptoms = symptoms.filter(s => s.expression).filter(s => evaluateCondition(parseCondition(s.expression)));
                // const _symptoms = symptoms;
                const riskSignCount = _symptoms.reduce((acc, s) => {
                    if (s.type === 'risk') acc.riskCount += Number(s.weight || 1);
                    if (s.type === 'sign') acc.signCount += Number(s.weight || 1);
                    return acc;
                }, { riskCount: 0, signCount: 0 }); // @ts-ignore
                
                const conditionMet = evaluateCondition(parseCondition(expression, [{
                    values: [ 
                        { key: 'riskCount', value: riskSignCount.riskCount, },
                        { key: 'signCount', value: riskSignCount.signCount, },
                    ],
                }]));
                // const conditionMet = i < 2;
                return conditionMet ? { ...d.data, symptoms: _symptoms, ...d, } : null;
            }).filter(d => d);
        
            return rslts;
        })();
        
        return diagnosesRslts;
    };

    function restructureForm() {

       
        return form.map(section => {
          const newSection = { ...section };
          const newValues = [];
          for (const item of section.values || []) {
            if (item.key === "repeatables") {
              // Apply dropEmptyValueObjects only to repeatables
              newSection.repeatables = dropEmptyValueObjects(item.value);
            } else {
              newValues.push(item);
            }
            
          }
          
          newSection.values = newValues;
          return newSection;
        });
      } 
        /**
       * Recursively removes all properties where 'value' is an empty object
       * @param data Input data (object or array)
       * @returns Cleaned data with empty value objects removed
       */
            function dropEmptyValueObjects<T>(data: T): T {
                if (Array.isArray(data)) {
                  return data.map(item => dropEmptyValueObjects(item)).filter(Boolean) as T;
                }
               
                if (typeof data === 'object' && data !== null) {
                  const result: any = {};
                if(Object.keys(data).length<=0){
                    return data
                }
                  for (const [key, value] of Object.entries(data)) {
                    // Skip if this is a 'value' property that's an empty object
                    if (key === 'value' && typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
                      continue;
                    }
                    
                    // Recursively process nested objects/arrays
                    result[key] = dropEmptyValueObjects(value);
                  }
                  
                  return result;
                }
              
                return data;
              } 
      
    function createSessionSummary(_payload: any = {}) {        
        const { completed, cancelled, ...payload } = _payload;
        let uid = form.reduce((acc, { values }) => {
            const uid = values.reduce((acc, { key, value }) => {
            key = `${key}`.toLowerCase();
            if (
                ['uid', 'nuid'].includes(key) ||
                key.match(/nuid_/gi)
            ) return value;
            return acc;
            }, null);
        
            return uid || acc;
        }, '');

        uid = uid || generatedUID;
        
        const neolabKeys = ['DateBCT', 'BCResult', 'Bac', 'CONS', 'EC', 'Ent', 'GBS', 'GDS', 'Kl', 'LFC', 'NLFC', 'OGN', 'OGP', 'Oth', 'Pseud', 'SA'];
    
        return {
            ...payload,
            uid, //: __DEV__ ? `${Number(Math.random().toString().substring(2, 6))}-TEST` : uid,
            script_id: activeScreen?.script_id || script_id,
            data: {
				unique_key: `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
				app_mode: application?.mode,
				country: location?.country,
				hospital_id: location?.hospital,
				started_at: session?.data?.started_at || startTime,
				completed_at: completed ? new Date().toISOString() : null,
				canceled_at: cancelled ? new Date().toISOString() : null,
				script,
				management: screens
					.map(s => s.data)
					.filter(s => s.type === 'management')
					.filter(s => s.printable),
				diagnoses: [],
				form: restructureForm(),
				matchingSession: session?.data?.matchingSession || matchingSession,
				matched: session?.data?.matched || (script.type !== 'discharge' ? [] : matches.reduce((acc, s) => {
					if (s.data.script.type !== 'discharge') {
						Object.keys(s.data.entries).forEach(key => {
							if (neolabKeys.includes(key)) acc.push({ key, ...s.data.entries[key] });
						});
						// Object.keys(s.data.entries).forEach(key => {
						//   acc.push({ key, ...s.data.entries[key] });
						// });
					}
					return acc;
				}, [])),
            },
        };
    };   
    


    const getScreenIndex = (screenId: string | number) => !screenId ? -1 : screens.map(s => s.id).indexOf(screenId);

    return {
        evaluateCondition,

        parseCondition,

        getScreen,

        getLastScreen,

        createSessionSummary,

        getSuggestedDiagnoses,    
        
        getScreenIndex
    };
}  

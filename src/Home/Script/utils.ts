import { ContextType } from './Context';
import * as types from '../../types';

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
};
  
export const getScriptUtils = ({
	script_id,
    script,
    activeScreen,
    activeScreenIndex,
    screens,
    diagnoses,
    entries: form,
    // cachedEntries,
    // activeScreenEntry,
    configuration,
    application,
    location,
    startTime,
    matchingSession,
	session,
}: UtilsParams) => {
    const matches: any[] = [];

    function parseCondition(_condition = '', entries: ContextType['entries'] = []) {    
        _condition = (_condition || '').toString();
    
        const _form = entries.reduce((acc, e) => {
            const index = !e.screen ? -1 : acc.map(e => e.screen.id).indexOf(e.screen.id);
            if (index > -1) return acc.map((_e, i) => i === index ? { ..._e, ...e } : _e);
            return [...acc, e];
        }, form);
    
        const parseValue = (condition = '', { value, calculateValue, type, key, dataType, }: types.ScreenEntryValue) => {
            value = ((calculateValue === null) || (calculateValue === undefined)) ? value : calculateValue;
            value = ((value === null) || (value === undefined)) ? 'no value' : value;
            const t = dataType || type;
    
            switch (t) {
            // case 'number':
            //   value = value || null;
            //   break;
            case 'boolean':
                value = value === 'false' ? false : Boolean(value);
                break;
            default:
                value = JSON.stringify(value);
            }
    
            return parseConditionString(condition, key, value);
        };
    
        let parsedCondition = _form.reduce((condition: string, { screen, values }: types.ScreenEntry) => {
            values = values.filter(e => (e.value !== null) || (e.value !== undefined));
    
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
    }

    function getScreen(opts?: { direction?: 'next' | 'back', index?: number; }) {
        const { index: i, direction: d } = { ...opts };
        const direction = (d && ['next', 'back'].includes(d)) ? d : null;
        
        if ((i !== undefined) && !isNaN(Number(i))) return screens[i] ? { screen: screens[i], index: i } : null;
        
        const getTargetScreen = (i = activeScreenIndex): null | { screen: types.Screen, index: number; } => {
            const index = (() => {
                switch (direction) {
                    case 'next':
                        return i + 1;
                    case 'back':
                        return i - 1;
                    default:
                        return i;
                }
            })();
        
            const screen = screens[index];
            
            if (!screen) return null;
        
            if (!direction) return { screen, index, };
        
            const target = { screen, index };
            const condition = screen.data.condition;
        
            if (!condition) return target;
        
            return evaluateCondition(parseCondition(condition)) ? target : getTargetScreen(index);
        };
        
        return getTargetScreen();
    };
    
    function getLastScreen() {
        if (!activeScreen) return null;
    
        const getScreenIndex = (s: types.Screen) => !s ? -1 : screens.map(s => s.id).indexOf(s.id);
        const activeScreenIndex = getScreenIndex(activeScreen);
    
        const getLastScreen = (currentIndex: number): types.Screen => {
            const _current = screens[currentIndex];
    
            const nextIndex = currentIndex + 1;
            let next = screens[nextIndex];
    
            if (next && next.data.condition) {
                const conditionMet = evaluateCondition(parseCondition(next.data.condition, form.filter(e => e.screen.id !== next.id)));
                if (!conditionMet) {
                    const nextNextIndex = nextIndex + 1;
                    next = nextNextIndex > screens.length ? null : getLastScreen(nextNextIndex);
                }
            }
    
            const lastIndex = getScreenIndex(next);
            return lastIndex > -1 ? getLastScreen(lastIndex) : _current;
        };
    
        return getLastScreen(activeScreenIndex);
    }

    function getSuggestedDiagnoses() {
        // return diagnoses.map((d, i) => d.data).filter((d, i) => i < 4);
        diagnoses = diagnoses.reduce((acc: types.Diagnosis[], d) => {
            if (acc.map(d => d.diagnosis_id).includes(d.diagnosis_id)) return acc;
            return [...acc, d];
        }, []);
        
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

    function createSessionSummary(_payload: any = {}) {        
        const { completed, cancelled, ...payload } = _payload;
        
        const uid = form.reduce((acc, { values }) => {
            const uid = values.reduce((acc, { key, value }) => {
            if (`${key}`.match(/uid/gi)) return value;
            return acc;
            }, null);
        
            return uid || acc;
        }, null);
        
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
				diagnoses: [],
				form,
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
        
        getScreenIndex,
    };
}  

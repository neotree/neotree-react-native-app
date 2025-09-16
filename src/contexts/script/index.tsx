import { 
    createContext, 
    useContext, 
    useState, 
    useMemo, 
    useCallback,
} from "react";
import { type TextProps, Alert, View, TouchableOpacity, Platform } from 'react-native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { type DrawerNavigationOptions } from '@react-navigation/drawer';
import Icon from '@expo/vector-icons/MaterialIcons';

import * as types from '@/src/types';
import * as api from '@/src/data';
import { generateUID } from '@/src/utils/uid';
import { defaultPreferences } from '@/src/constants';
import { Theme, Text, Box, Modal, Radio, useTheme } from '@/src/components';
import { evaluateDrugsScreen } from '@/src/utils/evaluate-drugs-screen';
import { evaluateFluidsScreen } from '@/src/utils/evaluate-fluids-screen';

type ScriptContextProviderProps = types.StackNavigationProps<types.HomeRoutes, 'Script'>;

export type ScriptContextType = ReturnType<typeof useScriptContextValue> & ScriptContextProviderProps;

export const ScriptContext = createContext<null | ScriptContextType>(null);

export const useScriptContext = () => {
    const ctx = useContext(ScriptContext);
    if (!ctx) throw new Error('Cannot use `ScriptContext` outside the `ScriptContextProvider`');
    return ctx;
};

export function ScriptContextProvider({ children, ...props }: ScriptContextProviderProps & {
    children: React.ReactNode;
}) {
    const ctxValue = useScriptContextValue(props);

    return (
        <ScriptContext.Provider
            value={ctxValue}
        >
            <>
                {children}
            </>
        </ScriptContext.Provider>
    )
}

export type MoreNavOptions = {
    title?: string;
    titleStyle?: TextProps['style'];
    subtitle?: string;
    hideHeaderRight?: boolean;
    hideSubtitle?: boolean;
    showFAB?: boolean;
    hideSearch?: boolean;
    headerRight?: DrawerNavigationOptions['headerRight'];
    goBack?: () => void;
    goNext?: () => void;
};

function useScriptContextValue(props: ScriptContextProviderProps) {
    const { route, navigation, } = props;

    const theme = useTheme();

    const [isReady, setIsReady] = useState(false);
    const [generatedUID, setGeneratedUID] = useState('');

    const [shouldConfirmExit, setShoultConfirmExit] = useState(false);
    const [shouldReview, setShouldReview] = useState(false);
    const [review, setReview] = useState(false)
    const [moreNavOptions, setMoreNavOptions] = useState<null | MoreNavOptions>(null);

    const [startTime] = useState(new Date().toISOString());
    const [refresh, setRefresh] = useState(false);

    const [loadingScreen, setLoadingScreen] = useState(false);
    const [nuidSearchForm, setNuidSearchForm] = useState<types.NuidSearchFormField[]>([]);
    const [matched, setMatched] = useState<types.MatchedSession | null>(null);
    const [patientDetails, setPatientDetails] = useState({
        isTwin: false,
        twinID: '',
    });

    const [mountedScreens, setMountedScreens] = useState<{ [id: string]: boolean; }>({});

    const [sessionID, setSessionID] = useState<null | number | string>(route.params?.session?.id || null);

    const [application, setApplication] = useState<null | types.Application>(null);
    const [location, setLocation] = useState<null | types.Location>(null);

    const [displayLoader, setDisplayLoader] = useState(false);

    const [summary, setSummary] = useState<any>(null);

    const [loadingScript, setLoadingScript] = useState(false);
    const [script, setScript] = useState<null | types.Script>(null);
    const [screens, setScreens] = useState<types.Screen[]>([]);
    const [diagnoses, setDiagnoses] = useState<types.Diagnosis[]>([]);
    const [drugsLibrary, setDrugsLibrary] = useState<types.DrugsLibraryItem[]>([]);
    const [loadScriptError, setLoadScriptError] = useState('');

    const [loadingConfiguration, setLoadingConfiguration] = useState(false);
    const [configuration, setConfiguration] = useState<types.Configuration>({});
    const [, setLoadConfigurationError] = useState('');

    const [activeScreen, setActiveScreen] = useState<null | types.Screen>(null);
    const [lastPage, setLastPage] = useState<null | types.Screen>(null);
    const [lastPageIndex, setLastPageIndex] = useState<null | types.Screen>(null);
    const [activeScreenIndex, setActiveScreenIndex] = useState((route.params?.session?.data?.form || []).length);

    const [entries, setEntries] = useState<types.ScreenEntry[]>(route.params?.session?.data?.form || []);
    const [cachedEntries, setCachedEntries] = useState<types.ScreenEntry[]>(route.params?.session?.data?.form || []);

    const setCacheEntry = useCallback((entry: types.ScreenEntry) => !entry ? null : setCachedEntries(entries => {
        const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
        return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
    }), [entries]);

    
    const getCachedEntry = useCallback((screenIndex: number): types.ScreenEntry | undefined => {
        return cachedEntries.find(e => `${e.screenIndex}` === `${screenIndex}`);
    }, [cachedEntries]);

    const setEntry = useCallback((entry?: types.ScreenEntry) => {
        if (entry) {
            setEntries(entries => {
                const isAlreadyEntered = entries.map(e => `${e.screen.id}`).includes(`${entry.screen.id}`);
                return (isAlreadyEntered ? entries.map(e => `${e.screen.id}` === `${entry.screen.id}` ? entry : e) : [...entries, entry]);
            });
            setCacheEntry(entry);
        }
    }, [setCacheEntry]);

    const removeEntry = useCallback((screenId: string | number) => {
        setCacheEntry(entries.filter(e => e.screen.id === screenId)[0]);
        setEntries(entries => entries.filter(e => e.screen.id !== screenId));
    }, [entries, setCacheEntry]);

    const activeScreenEntry = useMemo(() => {
        return entries.filter(e => e.screenIndex === activeScreenIndex)[0];
    }, [entries, activeScreenIndex]);

    const [reviewConfigurations, setReviewConfigurations] = useState<any[]>([]);

    const evaluateCondition = useCallback((condition: string, defaultEval = false) => {
        let conditionMet = defaultEval;
        try {
            conditionMet = eval(condition);
        } catch (e) {
            // do nothing
        }
        return conditionMet;
    }, []);

    const sanitizeCondition = useCallback((condition: string) => {
        let sanitized = condition
            .replace(new RegExp(' and ', 'gi'), ' && ')
            .replace(new RegExp(' or ', 'gi'), ' || ')
            .replace(new RegExp(' = ', 'gi'), ' == ');
        sanitized = sanitized.split(' ')
            .map(s => s[0] === '$' ? `'${s}'` : s).join(' ');
        return sanitized;
    }, []);

    const parseConditionString = useCallback((condition: string, _key = '', value: any) => {
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
    }, []);

    const flattenRepeatables = useCallback((values: any[]): types.ScreenEntryValue[] => {
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
    }, []);

    const parseCondition = useCallback((
        _condition = '', 
        _entries: ({ values: types.ScreenEntry['values'], screen?: types.ScreenEntry['screen'] })[] = []
    ) => {
        _condition = (_condition || '').toString();
    
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
                acc = [...acc, v];
                if (v.value2 && v.key2) acc = [...acc, { value: v.value2, key: v.key2, }];
                return acc;
            }, []);
            
            // First filter out null/undefined values
            values = values.filter(e => (e.value !== null) && (e.value !== undefined));
            
            // Flatten repeatable structures if they exist
            values = flattenRepeatables(values);
            
            // Handle both array and non-array values
            values = values
                .reduce((acc: types.ScreenEntryValue[], e) => {
                    acc = [
                        ...acc,
                        ...(e.value && Array.isArray(e.value) ? e.value : [e]),
                    ];

                    acc.forEach(v => {
                        if (v.value2) {
                            acc.push({
                                ...v,
                                value: v.value2,
                            });
                        }
                    });

                    return acc;
                }, []);
    
            let c = values.reduce((acc, v) => parseValue(acc, v), condition);

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
    
        return sanitizeCondition(parsedCondition);
    }, [entries, configuration, nuidSearchForm, parseConditionString, flattenRepeatables, sanitizeCondition]);

    const getScreen = useCallback((opts?: { direction?: 'next' | 'back', index?: number; }) => {
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
        
        return getTargetScreen();
    }, [
        entries, 
        activeScreen, 
        activeScreenEntry, 
        activeScreenIndex, 
        drugsLibrary, 
        screens, 
        evaluateCondition, 
        parseCondition,
    ]);

    const getLastScreen = useCallback(() => {
        if (!activeScreen) return null;
    
        const getScreenIndex = (s: types.Screen) => !s ? -1 : screens.map(s => s.id).indexOf(s.id);
        const activeScreenIndex = getScreenIndex(activeScreen);
    
        const getLastScreen = (currentIndex: number): null | types.Screen => {    
            let lastScreenIndex = currentIndex + 1;
            let lastScreen = lastScreenIndex >= screens.length ? null : screens[lastScreenIndex];

            if (lastScreen?.type === 'drugs') {
                const s = evaluateDrugsScreen({
                    entries: entries,
                    drugsLibrary,
                    screen: lastScreen,
                    evaluateCondition: (condition) => evaluateCondition(parseCondition(condition)),
                });

                lastScreen = s;
    
                if (!s.data?.metadata?.drugs?.length) {
                    // lastScreen = getLastScreen(lastScreenIndex);
                    return null;
                }
            }

            if (lastScreen?.type === 'fluids') {
                const s = evaluateFluidsScreen({
                    entries: entries,
                    drugsLibrary,
                    screen: lastScreen,
                    evaluateCondition: (condition) => evaluateCondition(parseCondition(condition)),
                });

                lastScreen = s;
    
                if (!s.data?.metadata?.fluids?.length) {
                    // lastScreen = getLastScreen(lastScreenIndex);
                    return null;
                }
            }

            const condition: string = lastScreen?.data?.condition || '';
            const conditionSplit = condition.split('\n').map(c => c.trim()).filter(c => c);
            if (condition) {
                const parsedCondition = parseCondition(condition, entries.filter(e => e.screen.id !== lastScreen.id));
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
            
            return screens[lastScreenIndex];
        };
    
        return getLastScreen(activeScreenIndex) || activeScreen;
    }, [entries, drugsLibrary, activeScreen, activeScreenIndex, screens, evaluateCondition, parseCondition]);

    const getSuggestedDiagnoses = useCallback(() => {
        let _diagnoses = diagnoses.reduce((acc: types.Diagnosis[], d) => {
            if (acc.map(d => d.diagnosis_id).includes(d.diagnosis_id)) return acc;
            return [...acc, d];
        }, []);

        _diagnoses = [
            ..._diagnoses.filter(d => d.data.severity_order || (d.data.severity_order === 0))
                .sort((a, b) => a.data.severity_order - b.data.severity_order),
            ..._diagnoses.filter(d => (d.data.severity_order === null) || (d.data.severity_order === undefined) || (d.data.severity_order === '')),
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
            const rslts = (_diagnoses || []).filter(({ data: { symptoms, expression } }) => {
                return expression || (symptoms || []).length;
            }).map((d) => {
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
    }, [diagnoses, evaluateCondition, parseCondition]);

    const restructureForm = useCallback(() => {
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
       
        return entries.map(section => {
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
      }, [entries]);

    const createSessionSummary = useCallback((_payload: any = {}) => {    
        const { completed, cancelled, ...payload } = _payload;

        const matchingSession = matched?.session || null;
		const session = route.params?.session;
        const matches: any[] = [];

        let uid = entries.reduce((acc, { values }) => {
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
            script_id: activeScreen?.script_id || route.params.script_id,
            type: script?.type,
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
    }, [
        route, 
        entries, 
        matched, 
        generatedUID, 
        activeScreen, 
        application, 
        location,
        screens,
        script,
        restructureForm,
    ]);

    const getScreenIndex = useCallback((screenId: string | number) => {
        return !screenId ? -1 : screens.map(s => s.id).indexOf(screenId);
    }, [screens]);

    const saveSession = useCallback((params?: any) => new Promise((resolve, reject) => {
        const summary = createSessionSummary(params);
        (async () => {
            try {
                const res = await api.saveSession({
                    id: sessionID,
                    ...summary
                });
                setSessionID(res?.sessionID);
                resolve(summary);
            } catch (e) {

                reject(e);
            }
        })();
    }), [createSessionSummary]);

    const createSummaryAndSaveSession = useCallback((params?: any) => new Promise((resolve, reject) => {
        setDisplayLoader(true);
        (async () => {
            try {
                const summary = await saveSession(params);
                api.exportSessions().then(() => { }).catch(() => { });
                setSummary(summary);
                resolve(summary);
            } catch (e) {

                reject(e);
            }
            setDisplayLoader(false);
        })();
    }), [saveSession]);

    const loadScript = useCallback(async () => {
        try {
            setLoadingScript(true);
            setLoadScriptError('');
            setScript(null);
            setScreens([]);
            setDiagnoses([]);
            setActiveScreen(null);
            setDrugsLibrary([]);

            const { script, screens, diagnoses, } = await api.getScript({ script_id: route.params.script_id, });
            const drugsLibrary = await api.getDrugsLibrary();

            const uid = await generateUID(script?.type);
            setGeneratedUID(uid);
            setScript(script);
            setScreens(screens);
            setDiagnoses(diagnoses);
            setDrugsLibrary(drugsLibrary.map(d => d.data));
            setLoadingScript(false);
            setReviewConfigurations(script?.data?.reviewConfigurations)
            setShouldReview(script.data?.reviewable)
            if (route.params?.session?.data?.form?.length) {
                const lastEntry = route.params.session.data.form[route.params.session.data.form.length - 1];
                const activeScreenIndex = screens.map((s, i) => {
                    if (
                        (s.screen_id === lastEntry?.screen?.screen_id) ||
                        (s.screenId === lastEntry?.screen?.screen_id)
                    ) return i;
                    return null;
                }).filter(i => i !== null)[0];

                if (lastEntry && activeScreenIndex >= 0) {
                    setActiveScreen(screens[activeScreenIndex]);
                    setActiveScreenIndex(activeScreenIndex);
                }
            }
        } catch (e: any) {
            console.log(e);
            setLoadScriptError(e.message);
        } finally {
            setLoadingScript(false);
            setIsReady(true);
        }
    }, [navigation, route]);

    const loadConfiguration = useCallback(() => {
        (async () => {
            try {
                setLoadingConfiguration(true);
                const configuration = await api.getConfiguration();
                setConfiguration({ ...configuration?.data });
                setLoadingConfiguration(false);
            } catch (e: any) {
                setLoadConfigurationError(e.message);
            }
        })();
    }, []);

    const confirmExit = useCallback(() => {
        setShoultConfirmExit(true);
    }, []);

    const getEntryValueByKey = useCallback((key: string) => {
        key = `${key || ''}`.replace('$', '');
        let value: null | types.ScreenEntryValue = null;
        entries.forEach(e => e.values.forEach(v => {
            if (`${v.key}`.toLowerCase() === `${key}`.toLowerCase()) {
                value = v;
            }
        }));
        return value;
    }, [entries]);

    const getBirthFacilities = useCallback((): any[] => {
        // ["ReferredFrom", 'BirthFacility']
        const s = screens.filter(s => ['BirthFacility'].includes(s?.data?.metadata?.key))[0]
        return (s?.data?.metadata?.items || []);
    }, [screens]);

    const handleReviewNoPress = useCallback(async () => {
        const summary = await createSummaryAndSaveSession({ completed: true });
        setShouldReview(false);
        setReview(false);
        setSummary(summary);
    }, [createSummaryAndSaveSession]);

    const goNext = useCallback(async () => {
        await new Promise((resolve) => {
            setLoadingScreen(true);
            setTimeout(() => resolve(null), 0);
        });

        const lastScreen = { ...getLastScreen() };
        const lastScreenIndex = screens.map(s => `${s.id}`).indexOf(`${lastScreen?.id}`);
        //Set This For Review Screen
        if(lastScreen){
            setLastPage(lastScreen)
            setLastPageIndex(lastScreenIndex)
        }
        const next = getScreen({ direction: 'next' });
        const nextScreen = next?.screen || lastScreen;
        const nextScreenIndex = next?.screen ? next?.index : lastScreenIndex;

        if (summary) {
            navigation.navigate('Home');
            setLoadingScreen(false);
            return;
        }
       
        if ((activeScreen?.id === lastScreen?.id) && 
         cachedEntries?.filter(e => `${e.screenIndex}` === `${lastScreenIndex}`).length>0) {
            if (reviewConfigurations?.length > 0) {
                setReview(true)
            } else {
                await handleReviewNoPress()
            }
            setLoadingScreen(false);
        } else {
            if (nextScreen) {
                if (activeScreen.review) {
                    setRefresh(true)
                    setReview(false)
                    setActiveScreenIndex(lastPageIndex);
                    lastPage.review = false
                    setActiveScreen(lastPage);
                    setEntry(cachedEntries.filter(e => `${e.screenIndex}` === `${lastPageIndex}`)[0]);
                    setTimeout(() => setRefresh(false), 2);
                    saveSession();

                } else {
                    setRefresh(true);
                    setEntry(cachedEntries.filter(e => `${e.screenIndex}` === `${nextScreenIndex}`)[0]);
                    setActiveScreenIndex(nextScreenIndex);
                    setActiveScreen(nextScreen);
                    setTimeout(() => setRefresh(false), 10);
                    saveSession();
                }
                setLoadingScreen(false);
            } else {
                setLoadingScreen(false);
                Alert.alert(
                    'ERROR',
                    'Failed to load next screen. Screen condition might be invalid',
                    [
                        {
                            text: 'Exit',
                            onPress: () => navigation.navigate('Home'),
                            style: 'cancel'
                        },
                    ]
                );
            }
        }
    }, [activeScreen, navigation, handleReviewNoPress, getLastScreen, getScreen]);

    const goBack = useCallback(async () => {
        const loadingScreenState = activeScreenIndex > 0;

        await new Promise((resolve) => {
            setLoadingScreen(loadingScreenState);
            setTimeout(() => resolve(null), 0);
        });

        if (summary || !activeScreen) {
            navigation.navigate('Home');
            setLoadingScreen(false);
            return;
        }

        if (activeScreenIndex === 0) {
            setLoadingScreen(false);
            confirmExit();
        } else {
            const prev = getScreen({ direction: 'back' });
            if (prev?.screen) {
                setRefresh(true);
                removeEntry(activeScreen?.id);
                setEntry(getCachedEntry(prev.index));
                setActiveScreenIndex(prev.index);
                setActiveScreen(prev.screen);
                setTimeout(() => setRefresh(false), 10);
                saveSession();
            }
        }

        setLoadingScreen(false);
    }, [summary, activeScreen, navigation, removeEntry, setEntry, saveSession, confirmExit, getScreen]);

    const getFieldPreferences = useCallback((field: string, screen = activeScreen) => {
        const preferences = {
            ...defaultPreferences,
            ...screen?.data?.preferences,
        } as typeof defaultPreferences;

        const fieldPreferences = {
            fontSize: preferences.fontSize[field],
            fontWeight: preferences.fontWeight[field],
            fontStyle: preferences.fontStyle[field] || [],
            textColor: preferences.textColor[field],
            backgroundColor: preferences.backgroundColor[field],
            highlight: preferences.highlight[field],
        };

        const styleObj: { [key: string]: any; } = {
            color: fieldPreferences?.textColor,
            fontStyle: !fieldPreferences.fontStyle.includes('italic') ? undefined : 'italic',
            fontWeight: !fieldPreferences?.fontWeight ? undefined : {
                bold: 900,
            }[fieldPreferences.fontWeight!],
            fontSize: !fieldPreferences?.fontSize ? undefined : {
                xs: 6,
                sm: 12,
                default: undefined,
                lg: 20,
                xl: 26,
            }[fieldPreferences.fontSize!],
        };

        const style = Object.keys(styleObj).reduce((acc, key) => {
            if (styleObj[key] === undefined) return acc;
            return {
                ...acc,
                [key]: styleObj[key],
            };
        }, {}) as TextProps['style'];

        return {
            ...fieldPreferences,
            style,
        };
    }, [activeScreen]);

    const setNavOptions = useCallback(() => {
        navigation.setOptions(getNavOptions({
            script,
            theme,
            activeScreen,
            activeScreenIndex,
            moreNavOptions,
            getFieldPreferences,
            confirmExit,
            goBack: moreNavOptions?.goBack || goBack,
            goNext: moreNavOptions?.goNext || goNext,
        }));
    }, [
        script,
        route,
        navigation,
        theme,
        activeScreen,
        activeScreenIndex,
        moreNavOptions,
        summary,
        getFieldPreferences,
        confirmExit,
        goBack,
        goNext,
    ]);

    const handleReviewChange = useCallback((screen_id: any, lastPage: types.Screen, lastPageIndex: number) => {

        let as = screens.find(f => f.screen_id === screen_id)
    
        if (as) {
            let index = screens.indexOf(as)
            const prev = getScreen({ direction: 'back',index });
    
            if(prev?.screen){
                setRefresh(true);
                prev.screen.review = true
                setActiveScreen(prev.screen);
                setActiveScreenIndex(prev.index);	
                setEntry(getCachedEntry(prev.index));
                setTimeout(() => setRefresh(false), 10);
                setReview(false)
                setLastPage(lastPage)
                setLastPageIndex(lastPageIndex)	
            }			

        }
    }, [
        screens, 
        getScreen,
        setRefresh,
        setActiveScreen,
        setActiveScreenIndex,
        setEntry,
        getCachedEntry,
        setRefresh,
        setReview,
        setLastPage,
        setLastPageIndex,
    ]);

    const getRepeatablesPrepopulation = useCallback(() => {
        try {
            const autoFill = nuidSearchForm?.[0]?.results?.session?.data?.entries?.repeatables
                ?? nuidSearchForm?.[0]?.results?.autoFill?.data?.entries?.repeatables;

            if (autoFill && typeof autoFill === 'object') {
                return autoFill
            }

            return null;
        } catch {
            return null;
        }
    }, [nuidSearchForm]);

    const getPrepopulationData = useCallback((prePopulationRules?: string[]) => {
        const results = nuidSearchForm
            .filter(f => f.results)
            .filter(f => {
                const metadata = activeScreen.data.metadata;
                const fields: any[] = metadata.fields || [];
                const items: any[] = metadata.items || [];

                const canPrePopulate = (rules: string[]) => {
                    const prePopulate = rules;
                    if (!prePopulate.length) return false;
                    if (prePopulate.includes('allSearches')) return true;
                    const isTwinSearch = f.key === 'BabyTwinNUID';
                    if (!prePopulate.includes('twinSearches') && isTwinSearch) return false;
                    return true;
                };

                let isPrePopulatable = canPrePopulate(prePopulationRules || activeScreen.data.prePopulate || activeScreen.data.metadata.prePopulate || []);

                fields.forEach(f => {
                    const isTrue = canPrePopulate(f.prePopulate || []);
                    if (isTrue) isPrePopulatable = true;
                });

                items.forEach(f => {
                    const isTrue = canPrePopulate(f.prePopulate || []);
                    if (isTrue) isPrePopulatable = true;
                });

                return isPrePopulatable;
            });
        const twin = results.filter(item => item.key === 'BabyTwinNUID')[0];
        return {
            ...results.reduce((acc, item) => ({
                ...acc,
                ...item?.results?.autoFill?.data?.entries,
            }), {}),
            ...twin?.results?.autoFill?.data?.entries,
        };
    }, [nuidSearchForm, activeScreen]);

    const setEntryValues = useCallback((values?: types.ScreenEntry['values'], otherValues?: any) => {
        // setMountedScreens(prev => ({
        // 	...prev,
        // 	[activeScreen.id]: true,
        // }));	

        if (values) {
            const screenMeta = activeScreen.data.metadata;
            setEntry({
                values,
                prePopulate: activeScreen?.data?.prePopulate,
                screenIndex: activeScreenIndex,
                management: [],
                // management: screens
                // 	.filter(s => [activeScreen?.data?.refId, activeScreen?.data?.metadata?.key, `$${activeScreen?.data?.metadata?.key}`].includes(`${s.data?.refKey}`))
                // 	.map(s => s.data)
                // 	.filter(s => s.printable),
                screen: {
                    title: activeScreen.data.title,
                    sectionTitle: activeScreen.data.sectionTitle,
                    id: activeScreen.id,
                    screen_id: activeScreen.screen_id,
                    type: activeScreen.type,
                    metadata: {
                        label: screenMeta.label,
                        dataType: screenMeta.dataType,
                        title1: screenMeta.title1,
                        text1: screenMeta.text1,
                        image1: screenMeta.image1,
                        title2: screenMeta.title2,
                        text2: screenMeta.text2,
                        image2: screenMeta.image2,
                        title3: screenMeta.title3,
                        text3: screenMeta.text3,
                        image3: screenMeta.image3,
                    },
                    index: activeScreenIndex,
                },
                ...otherValues
            });
        } else {
            removeEntry(activeScreen.id,);
        }
    }, [activeScreen, activeScreenIndex, removeEntry, setEntries]);

    const init = useCallback(async () => {
        const app = await api.getApplication();
        setApplication(app);

        const location = await api.getLocation();
        setLocation(location);

        loadConfiguration();
        loadScript();
    }, [loadConfiguration, loadScript]);

    return {
        ...props,
        isReady,
        generatedUID,
        shouldConfirmExit,
        shouldReview,
        review,
        moreNavOptions,
        startTime,
        refresh,
        nuidSearchForm,
        matched,
        patientDetails,
        mountedScreens,
        sessionID,
        application,
        location,
        displayLoader,
        summary,
        loadingScript,
        script,
        screens,
        diagnoses,
        drugsLibrary,
        loadScriptError,
        loadingConfiguration,
        configuration,
        activeScreen,
        lastPage,
        lastPageIndex,
        activeScreenIndex,
        entries,
        cachedEntries,
        activeScreenEntry,
        reviewConfigurations,
        loadingScreen,
        init,
        setIsReady,
        setGeneratedUID,
        setShoultConfirmExit,
        setShouldReview,
        setReview,
        setMoreNavOptions,
        setRefresh,
        setNuidSearchForm,
        setMatched,
        setPatientDetails,
        setMountedScreens,
        setSessionID,
        setApplication,
        setLocation,
        setDisplayLoader,
        setSummary,
        setLoadingScript,
        setScript,
        setScreens,
        setDiagnoses,
        setDrugsLibrary,
        setLoadScriptError,
        setLoadingConfiguration,
        setConfiguration,
        setLoadConfigurationError,
        setActiveScreen,
        setLastPage,
        setLastPageIndex,
        setActiveScreenIndex,
        setEntries,
        setCachedEntries,
        setCacheEntry,
        getCachedEntry,
        setEntry,
        removeEntry,
        setReviewConfigurations,
        evaluateCondition,
        sanitizeCondition,
        parseConditionString,
        parseCondition,
        flattenRepeatables,
        getScreen,
        getLastScreen,
        getSuggestedDiagnoses,
        restructureForm,
        createSessionSummary,
        getScreenIndex,
        saveSession,
        createSummaryAndSaveSession,
        loadScript,
        loadConfiguration,
        confirmExit,
        getEntryValueByKey,
        getBirthFacilities,
        handleReviewNoPress,
        goNext,
        goBack,
        getFieldPreferences,
        setNavOptions,
        handleReviewChange,
        getRepeatablesPrepopulation,
        getPrepopulationData,
        setEntryValues,
    };
}

type GetNavOptionsParams = {
    script: null | types.Script;
    theme: Theme;
    activeScreen: null | types.Screen;
    activeScreenIndex: number;
    moreNavOptions: null | MoreNavOptions;
    getFieldPreferences: ReturnType<typeof useScriptContextValue>['getFieldPreferences'];
    goNext: () => void;
    goBack: () => void;
    confirmExit: () => void;
};

function RightActions({ color, screen, confirmExit, }: { 
	color?: string; 
	screen: types.Screen; 
	confirmExit: () => void; 
	goNext: () => void; 
}) {
	const [openModal, setOpenModal] = useState(false);
	const [openInfoModal, setOpenInfoModal] = useState(false);

	return (
		<>
			<Box flexDirection="row" justifyContent="flex-end" columnGap="s">
              
				{!!screen?.data?.infoText && (
					<Box marginRight="s">
						<TouchableOpacity onPress={() => setOpenInfoModal(true)}>
							<Icon 
								name="info" 
								size={24} 
								color={color}
							/>
						</TouchableOpacity>
					</Box>
				)}

				<TouchableOpacity onPress={() => setOpenModal(true)}>
					<Icon 
						name="more-vert" 
						size={24} 
						color={color}
					/>
				</TouchableOpacity>
			</Box>

			<Modal
				open={openModal}
				onClose={() => setOpenModal(false)}
				onRequestClose={() => setOpenModal(false)}
				title="Action"
				actions={[
					{
						label: 'Cancel',
						onPress: () => setOpenModal(false),
					}
				]}
			>
				<Radio
					label="Cancel script?"
					onChange={() => {
						setOpenModal(false);
						confirmExit();
					}}
				/>
			</Modal>

			<Modal
				open={openInfoModal}
				onClose={() => setOpenInfoModal(false)}
				onRequestClose={() => setOpenInfoModal(false)}
				title="Screen Info"
				actions={[
					{
						label: 'Cancel',
						onPress: () => setOpenInfoModal(false),
					}
				]}
			>
				<Text>{screen?.data?.infoText}</Text>
			</Modal>
		</>
	);
}

const headerTitle: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerTitle'] = params => {
	const { script, activeScreen, moreNavOptions, goBack, confirmExit, goNext } = params;

	return ({ tintColor }) => {
		const title = moreNavOptions?.title || (activeScreen ? activeScreen?.data?.title : script?.data?.title);
		const titleStyle = params.moreNavOptions?.titleStyle || ((activeScreen && !moreNavOptions?.title) ? params.getFieldPreferences('title')?.style : undefined);
		const headerRight = moreNavOptions?.headerRight;

		return (
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				{!!script && (
					<Box marginRight="s">
						<TouchableOpacity onPress={() => goBack()}>
							<Icon 
								name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
								size={28} 
								color={tintColor}
							/>
						</TouchableOpacity>
					</Box>
				)}

				<Box flex={1}>
					<Text
						style={[{ color: tintColor }, titleStyle]}
						variant="title3"
						numberOfLines={1}
					>{title}</Text>
					{!activeScreen ? null : (
						<Text
							color="textSecondary"
							variant="caption"
							numberOfLines={1}
						>{script?.data?.title}</Text>
					)}
				</Box>

				{!!headerRight && headerRight({ ...params, tintColor })}
				
				{!!script && (
					<Box>
						<RightActions color={tintColor} screen={activeScreen} confirmExit={confirmExit} goNext={goNext} />
					</Box>
				)}
			</View>
		);
	}; 
};

const headerTitlePlaceholder: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerTitle'] = () => () => {
    return (
        <Box>
        
        </Box>
    );
};

function getNavOptions(params: GetNavOptionsParams) {
    const opts: Partial<NativeStackNavigationOptions> = {};

    if (!params.script) {
        opts.headerTitle = headerTitlePlaceholder(params);
    } else {
        opts.headerTitle = headerTitle(params);
    }

    return opts;
}

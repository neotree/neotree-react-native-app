import React from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { RootStackParamList } from '@/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import { Diagnosis, Screen } from '@/api';
import { UseScriptLogic } from '../types';
import { useApiData } from './_useApiData';
import { useEntriesLogic } from './_useEntriesLogic';
import { parseCondition as _parseCondition, evaluateCondition, ParseConditionParams } from '../utils';
import { EXIT_SCRIPT_MODAL_MESSAGE, EXIT_SCRIPT_MODAL_TITLE, YES, CANCEL } from '@/constants/copy/script';

export function useScriptLogic(): UseScriptLogic {
    const mounted = React.useRef(false);
    React.useEffect(() => { 
        mounted.current = true;
        return () => mounted.current = false;
    }, []);

    const { params: { script_id, screen_id }, } = useRoute<RouteProp<RootStackParamList, 'Script'>>();
    const navigation = useNavigation();
    const [visitedScreens, setVisitedScreens] = React.useState<(number | string)[]>([]);
    const [refresh, setRefresh] = React.useState(false);
    const [shouldExit, setShouldExit] = React.useState(false);

    const apiData = useApiData({ script_id }); // load api data: script, screens, diagnoses & configuration
    const { screens, configuration, diagnoses } = apiData;
    const activeScreen = screens.filter(s => s.id === screen_id)[0] || screens[0];
    const isFirstScreen = activeScreen?.id === screens[0]?.id;

    const entriesLogic = useEntriesLogic({ apiData, activeScreen, screen_id, script_id, });

    const parseCondition = (condition: string, params: Partial<ParseConditionParams> = {}) => _parseCondition(condition, {
        configuration: { ...configuration, ...params.configuration },
        entries: params.entries || entriesLogic.entries,
    });

    function getSuggestedDiagnoses() {
        const _diagnoses = (diagnoses || []).reduce((acc: Diagnosis[], d) => {
            if (acc.map(d => d.diagnosis_id).includes(d.diagnosis_id)) return acc;
            return [...acc, d];
        }, []);
        
        const diagnosesRslts = (() => {
            const rslts = (_diagnoses || []).filter(({ data: { symptoms, expression } }) => {
            return expression || (symptoms || []).length;
            }).map((d, i) => {
            const { data: { symptoms: s, expression } } = d;
            const symptoms = s || [];
        
            const _symptoms = symptoms.filter(s => s.expression).filter(s => evaluateCondition(parseCondition(s.expression)));
            // const _symptoms = symptoms;
            const riskSignCount = _symptoms.reduce((acc, s) => {
                if (s.type === 'risk') acc.riskCount += Number(s.weight || 1);
                if (s.type === 'sign') acc.signCount += Number(s.weight || 1);
                return acc;
            }, { riskCount: 0, signCount: 0 });
        
            const conditionMet = evaluateCondition(parseCondition(expression, {
                entries: [{
                    values: [
                        { key: 'riskCount', value: riskSignCount.riskCount, },
                        { key: 'signCount', value: riskSignCount.signCount, },
                    ],
                }]
            }));
            // const conditionMet = i < 2;
            return conditionMet ? { ...d.data, symptoms: _symptoms, ...d, } : null;
            }).filter(d => d);
        
            return rslts;
        })();
        
        return diagnosesRslts;
    };

    const navigateToScreen = (screen_id: string | number) => {
        setRefresh(true);
        entriesLogic.setEntry(entriesLogic.cachedEntries.filter(e => e?.screen?.id === screen_id)[0]);
        navigation.navigate('Script', { script_id, screen_id });
        setVisitedScreens(prev => [ ...prev.filter(id => id !== screen_id), screen_id, ]);
        setTimeout(() => {
            if (mounted.current) {
                setRefresh(false);
            }
        }, 0);
    };

    function getScreen(nextOrPrev: 'next' | 'back', index?: number) {        
        if (!isNaN(Number(index))) return screens[index] ? { screen: screens[index], index } : null;
        const activeScreenIndex = screens.map(s => s.id).indexOf(activeScreen?.id);

        const getTargetScreen = (i = activeScreenIndex) => {
            const index = (() => {
            switch (nextOrPrev) {
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
        
            if (!nextOrPrev) return { screen, index, };
        
            const target = { screen, index };
            const condition = screen.data.condition;
        
            if (!condition) return target;
        
            return evaluateCondition(parseCondition(condition)) ? target : getTargetScreen(index);
        };
        
        return getTargetScreen() as { screen: Screen; index: number; };
    };

    function getLastScreen() {
        if (!activeScreen) return null;
        
        const getScreenIndex = s => !s ? -1 : screens.map(s => s.id).indexOf(s.id);
        const activeScreenIndex = getScreenIndex(activeScreen);
        
        const getLastScreen = (currentIndex) => {
            const _current = screens[currentIndex];
        
            const nextIndex = currentIndex + 1;
            let next = screens[nextIndex];
        
            if (next && next.data.condition) {
            const conditionMet = evaluateCondition(parseCondition(next.data.condition, {
                entries: entriesLogic.entries.filter(e => e.screen.id !== next.id),
            }));
            if (!conditionMet) {
                const nextNextIndex = nextIndex + 1;
                next = nextNextIndex > screens.length ? null : getLastScreen(nextNextIndex);
            }
            }
        
            const lastIndex = getScreenIndex(next);
            return lastIndex > -1 ? getLastScreen(lastIndex) : _current;
        };
        
        return getLastScreen(activeScreenIndex) as Screen;
    };

    const onNext = () => {
        const res = getScreen('next');
        if (res?.screen) {
            navigateToScreen(res.screen.id);
        }
    };

    const exit = () => {
        setShouldExit(true);
        setTimeout(() => Alert.alert(
            EXIT_SCRIPT_MODAL_TITLE,
            EXIT_SCRIPT_MODAL_MESSAGE,
            [
                {
                    text: CANCEL,
                    style: 'cancel',
                    onPress: () => setShouldExit(null),
                },
                {
                    text: YES,
                    onPress: () => navigation.navigate('Root'),
                }
            ]
        ), 100);
    };

    const onBack = () => {
        if (isFirstScreen) {
            exit();
        } else {
            entriesLogic.removeEntry(screen_id);
            const prevID = visitedScreens[visitedScreens.length - 2];
            setVisitedScreens(prev => prev.filter(id => id !== screen_id));
            navigateToScreen(prevID);
        }
        return false;
    };

    React.useEffect(() => navigation.addListener('beforeRemove', e => {
        if (!(isFirstScreen && shouldExit)) e.preventDefault();
    }), [navigation, isFirstScreen, shouldExit]);

    React.useEffect(() => {
        let backHandler = null;
        if (Platform.OS === 'android') {
          backHandler = BackHandler.addEventListener('hardwareBackPress', onBack);
        }
        return () => { if (backHandler) backHandler.remove(); };
    }, [navigation, activeScreen, shouldExit]);

    return {
        ...apiData,
        ...entriesLogic,
        refresh,
        activeScreen,
        shouldExit,
        exit,
        setRefresh,
        onNext,
        navigateToScreen,
        getScreen,
        onBack,
        getSuggestedDiagnoses,
        getLastScreen,
        parseCondition,
    };
}

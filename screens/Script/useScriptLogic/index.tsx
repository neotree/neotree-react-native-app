import React from 'react';
import { RootStackParamList } from '@/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import { Diagnosis, Screen } from '@/api';
import { UseScriptLogic } from '../types';
import { useApiData } from './_useApiData';
import { useEntriesLogic } from './_useEntriesLogic';
import { parseCondition as _parseCondition, evaluateCondition, ParseConditionParams } from '../utils';

export function useScriptLogic(): UseScriptLogic {
    const { params: { script_id, screen_id }, } = useRoute<RouteProp<RootStackParamList, 'Script'>>();
    const navigation = useNavigation();

    const apiData = useApiData({ script_id }); // load api data: script, screens, diagnoses & configuration
    const { screens, configuration, diagnoses } = apiData;
    const activeScreen = screens.filter(s => s.id === screen_id)[0] || screens[0];

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

    const navigateToScreen = React.useCallback((screen_id: string | number) => {
        entriesLogic.setEntry(entriesLogic.cachedEntries.filter(e => e?.screen?.id === screen_id)[0]);
        navigation.navigate('Script', { script_id, screen_id });
    }, [script_id]);

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

    const onBack = React.useCallback(() => {
        const res = getScreen('back');
        if (res?.screen) {
            navigateToScreen(res.screen.id);
            entriesLogic.removeEntry(res.screen.id);
        }
    }, [activeScreen, navigation]);

    return {
        ...apiData,
        ...entriesLogic,
        activeScreen,
        navigateToScreen,
        getScreen,
        onBack,
        getSuggestedDiagnoses,
        getLastScreen,
    };
}

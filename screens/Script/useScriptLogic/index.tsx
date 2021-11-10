import React from 'react';
import { RootStackParamList } from '@/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import { UseScriptLogic } from '../types';
import { useApiData } from './_useApiData';
import { useEntriesLogic } from './_useEntriesLogic';

export function useScriptLogic(): UseScriptLogic {
    const { params: { script_id, screen_id } } = useRoute<RouteProp<RootStackParamList, 'Script'>>();
    const navigation = useNavigation();

    const apiData = useApiData({ script_id }); // load api data: script, screens, diagnoses & configuration
    const { screens } = apiData;
    const activeScreen = screens.filter(s => s.id === screen_id)[0] || screens[0];

    const entries = useEntriesLogic({ apiData, activeScreen, screen_id, });

    const navigateToScreen = React.useCallback((screen_id: string | number) => {
        navigation.navigate('Script', { script_id, screen_id });
    }, [script_id]);

    const getScreen = nextOrPrev => {
        const currentScreenIndex = screens.map(s => s.id).indexOf(activeScreen?.id);
        const screen = nextOrPrev === 'next' ? screens[currentScreenIndex + 1] : screens[currentScreenIndex - 1];
        return screen;
    };

    const onBack = React.useCallback(() => {
        const screen = getScreen('prev');
        if (screen) {
            navigateToScreen(screen.id);
        }
    }, [activeScreen, navigation]);

    return {
        ...apiData,
        ...entries,
        activeScreen,
        navigateToScreen,
        getScreen,
        onBack,
    };
}

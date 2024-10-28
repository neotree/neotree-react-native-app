import { createContext, useContext, useCallback, useMemo } from "react";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";

import { useScript } from "@/hooks/script/use-script";
import { useConfirmModal } from "@/hooks/use-confirm-modal";

const ScreenContext = createContext<ReturnType<typeof useScreenContextValue>>(null!);

function useScreenContextValue() {
    const { screenId } = useLocalSearchParams();
    const navigation = useNavigation();
    const { script } = useScript();
    const { confirm } = useConfirmModal();

    const { screen, screenIndex, } = useMemo(() => {
        const screen = script!.screens.filter(s => s.screenId === screenId)[0];
        const screenIndex = script!.screens.map(s => s.screenId).indexOf(screen.screenId);
        return { screen, screenIndex };
    }, [script!.screens, screenId]);

    const goBack = useCallback((goBack?: () => void) => {
        if (screenIndex > 0) return goBack?.();
        confirm(() => router.push('/'), {
            title: '',
            message: 'Are you sure you want to cancel script?',
            positiveLabel: 'Yes',
            negativeLabel: 'No, don\'t cancel',
            danger: true,
        });
    }, [screenIndex, confirm]);

    useFocusEffect(useCallback(() => {
        const listener: Parameters<typeof navigation.addListener<'beforeRemove'>>[1] = e => {
            e.preventDefault();
            goBack(() => navigation.dispatch(e.data.action));
        };

        navigation.addListener('beforeRemove', listener);

        return () => navigation.removeListener('beforeRemove', listener);
    }, [navigation.addListener, navigation.dispatch, goBack]));

    return {
        screen,
        screenId,
        screenIndex,
        goBack,
    };
}

export const useScreenContext = () => useContext(ScreenContext);

export function ScreenContextProvider({ children }: { 
    children: React.ReactNode | ((ctx: ReturnType<typeof useScreenContextValue>) => React.ReactNode); 
}) {
    const ctx = useScreenContextValue();

    return (
        <ScreenContext.Provider
            value={ctx}
        >
            {typeof children === 'function' ? children(ctx) : children}
        </ScreenContext.Provider>
    )
}
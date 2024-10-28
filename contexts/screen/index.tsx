import { createContext, useContext, useCallback, useMemo } from "react";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";

import { useScript } from "@/hooks/script/use-script";
import { useConfirmModal } from "@/hooks/use-confirm-modal";

const ScreenContext = createContext<ReturnType<typeof useScreenContextValue>>(null!);

function useScreenContextValue() {
    const searchParams = useLocalSearchParams();
    const navigation = useNavigation();
    const { script } = useScript();
    const { confirm } = useConfirmModal();

    const { screenId } = searchParams;

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

    const onFAB = useCallback(() => {
        if (screenIndex === (script!.screens.length - 1)) {
            // TODO: Go to summary
        } else {
            const nextIndex = screenIndex + 1;
            const nextScreen = script!.screens[nextIndex];
            console.log('nextIndex', nextIndex);
            router.push({
                pathname: '/script/[scriptId]/screen/[screenId]',
                params: {
                    ...searchParams,
                    scriptId: searchParams.scriptId as string,
                    screenId: nextScreen.screenId,
                },
            })
        }
    }, [script!.screens, screenIndex, searchParams]);

    useFocusEffect(useCallback(() => {
        const listener: Parameters<typeof navigation.addListener<'beforeRemove'>>[1] = e => {
            e.preventDefault();
            goBack(() => navigation.dispatch(e.data.action));
        };

        navigation.addListener('beforeRemove', listener);

        return () => navigation.removeListener('beforeRemove', listener);
    }, [navigation.addListener, navigation.dispatch, goBack]));

    console.log('searchParams', searchParams);

    return {
        screen,
        screenId,
        screenIndex,
        goBack,
        onFAB,
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
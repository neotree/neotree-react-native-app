import { useEffect, useMemo } from "react";
import { SplashScreen } from 'expo-router';

import { useFonts } from "./use-fonts";
import { useAuthentication } from "./use-authentication";

export function useAppInit() {
    const { fontsLoaded, loadFontsErrors, } = useFonts();
    const { authInfoLoaded, loadAuthInfoErrors, ...authInfo } = useAuthentication();

    const isReady = useMemo(() => !!(
        authInfoLoaded && 
        fontsLoaded
    ),
    [
        authInfoLoaded, 
        fontsLoaded,
    ]);

    const appErrors = useMemo(() => [
        ...(loadFontsErrors || []),
        ...(loadAuthInfoErrors || []),
    ], [loadFontsErrors, loadAuthInfoErrors]);

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    return {
        isReady,
        errors: appErrors,
        ...authInfo,
    };
}

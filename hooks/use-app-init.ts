import { useEffect, useMemo } from "react";
import { SplashScreen } from 'expo-router';

import { useDatabase } from "./use-database";
import { useFonts } from "./use-fonts";
import { useAuthentication } from "./use-authentication";

export function useAppInit() {
    const { databaseLoaded, loadDatabaseErrors, } = useDatabase();
    const { fontsLoaded, loadFontsErrors, } = useFonts();
    const { authInfoLoaded, loadAuthInfoErrors, ...authInfo } = useAuthentication();

    const isReady = useMemo(() => !!(
        authInfoLoaded && 
        fontsLoaded &&
        databaseLoaded
    ),
    [
        authInfoLoaded, 
        fontsLoaded,
        databaseLoaded,
    ]);

    const appErrors = useMemo(() => [
        ...(loadFontsErrors || []),
        ...(loadAuthInfoErrors || []),
        ...(loadDatabaseErrors || []),
    ], [
        loadFontsErrors, 
        loadAuthInfoErrors,
        loadDatabaseErrors
    ]);

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    return {
        isReady,
        errors: appErrors,
        ...authInfo,
    };
}

import { useEffect, useMemo, useState } from "react";
import { useAssets } from "expo-asset";

import AsyncStorage from "@/data/async-storage";
import { assets } from "@/constants";
import { useDatabase } from "@/hooks/use-database";
import { useFonts } from "@/hooks/use-fonts";
import { useAuthentication } from "@/hooks/use-authentication";
import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";
import { useNetInfo } from "@/hooks/use-netinfo";
import { NeotreeConstantsStore } from '@/store/neotree-constants';

export function useAppInit() {
    const { hasInternet, } = useNetInfo();
    
    // load assets
    const [, loadAssetsError] = useAssets(Object.values(assets));

    //load fonts
    const { fontsLoaded, loadFontsErrors, } = useFonts();

    // initialise database
    const { databaseLoaded, loadDatabaseErrors, } = useDatabase();

    // check authentication
    const { authInfoLoaded, loadAuthInfoErrors, ...authInfo } = useAuthentication();

    /**** 
        *** CONFIGURE APP ****
        * set defaults (if first time running the app)
    ****/
    const [{ configurationErrors, configured, }, setConfigState] = useState({
        configured: false,
        configurationErrors: [] as string[],
    });

    useEffect(() => {
        (async () => {
            const errors: string[] = [];
            try {
                await AsyncStorage.init();
                const neotreeConstants = await AsyncStorage.getAll();
                await NeotreeConstantsStore.setState(neotreeConstants);
            } catch(e: any) {
                errors.push(e.message);
            } finally {
                setConfigState({
                    configurationErrors: errors,
                    configured: true,
                });
            }
        })();
    }, []);

    // sync remote - but only do this after everything is ready
    const { remotedSynced, syncRemoteErrors, sync } = useSyncRemoteData({ syncOnmount: false, });

    const initialised = useMemo(() => !!(
        authInfoLoaded && 
        fontsLoaded &&
        databaseLoaded &&
        configured
    ),
    [
        authInfoLoaded, 
        fontsLoaded,
        databaseLoaded,
        configured,
    ]);

    const initialiseErrors = useMemo(() => [
        ...(loadFontsErrors || []),
        ...(loadAuthInfoErrors || []),
        ...(loadDatabaseErrors || []),
        ...(loadAssetsError ? [loadAssetsError.message] : []),
        ...configurationErrors,
    ], [
        loadFontsErrors, 
        loadAuthInfoErrors,
        loadDatabaseErrors,
        loadAssetsError,
        configurationErrors,
    ]);

    const errors = useMemo(() => [
        ...initialiseErrors,
        ...(syncRemoteErrors || []),
    ], [initialiseErrors, syncRemoteErrors]);

    const isReady = useMemo(() => remotedSynced && initialised, [initialised, remotedSynced]);

    // after everything is loaded, run the remote data sync function
    useEffect(() => {
        if (initialised && !initialiseErrors.length) sync();
    }, [initialised, initialiseErrors, sync]);

    return {
        isReady,
        errors,
        hasInternet,
        ...authInfo,
    };
}

import { useEffect, useMemo, useState } from "react";
import { useAssets } from "expo-asset";

import { assets } from "@/constants";
import { useDatabase } from "@/hooks/use-database";
import { useFonts } from "@/hooks/use-fonts";
import { useAuthentication } from "@/hooks/use-authentication";
import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";
import { useNetInfo } from "@/hooks/use-netinfo";
import { useAsyncStorage } from '@/hooks/use-async-storage';

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
        *** CONFIGURE ASYNC STORAGE ****
    ****/
    const [{ asyncStorageConfigErrors, asyncStorageConfigured, }, setAsyncStorageConfigState] = useState({
        asyncStorageConfigured: false,
        asyncStorageConfigErrors: [] as string[],
    });

    useEffect(() => {
        (async () => {
            const errors: string[] = [];
            try {
                await useAsyncStorage.getState().init();
            } catch(e: any) {
                errors.push(e.message);
            } finally {
                setAsyncStorageConfigState({
                    asyncStorageConfigErrors: errors,
                    asyncStorageConfigured: true,
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
        asyncStorageConfigured
    ),
    [
        authInfoLoaded, 
        fontsLoaded,
        databaseLoaded,
        asyncStorageConfigured,
    ]);

    const initialiseErrors = useMemo(() => [
        ...(loadFontsErrors || []),
        ...(loadAuthInfoErrors || []),
        ...(loadDatabaseErrors || []),
        ...(loadAssetsError ? [loadAssetsError.message] : []),
        ...asyncStorageConfigErrors,
    ], [
        loadFontsErrors, 
        loadAuthInfoErrors,
        loadDatabaseErrors,
        loadAssetsError,
        asyncStorageConfigErrors,
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

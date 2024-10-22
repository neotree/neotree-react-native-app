import { useEffect, useMemo, useState } from "react";
import { useAssets } from "expo-asset";

import { assets } from "@/constants";
import { useDatabase } from "@/hooks/use-database";
import { useFonts } from "@/hooks/use-fonts";
import { useAuthentication } from "@/hooks/use-authentication";
import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";
import { useNetInfo } from "@/hooks/use-netinfo";
import { useAsyncStorage } from '@/hooks/use-async-storage';
import { useSocket } from "./use-socket";

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
    const { WEBEDITOR_URL, initialised: asyncStorageConfigured, errors: asyncStorageConfigErrors, } = useAsyncStorage();
    useEffect(() => { useAsyncStorage.getState().init(); }, []);

    // Initialise socket
    const { socketInitialised } = useSocket();
    useEffect(() => { useSocket.getState().init(WEBEDITOR_URL); }, [WEBEDITOR_URL]);

    // sync remote - but only do this after everything is ready
    const { remoteSynced, syncRemoteErrors, sync } = useSyncRemoteData();

    const initialised = useMemo(() => !!(
        authInfoLoaded && 
        fontsLoaded &&
        databaseLoaded &&
        asyncStorageConfigured &&
        socketInitialised
    ),
    [
        authInfoLoaded, 
        fontsLoaded,
        databaseLoaded,
        asyncStorageConfigured,
        socketInitialised,
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

    const isReady = useMemo(() => remoteSynced && initialised, [initialised, remoteSynced]);

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

import { useEffect, useMemo, useState } from "react";
import { useAssets } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { APP_VERSION, assets, asyncStorageKeys, CONFIG, SDK_VERSION } from "@/constants";
import { useDatabase } from "@/hooks/use-database";
import { useFonts } from "@/hooks/use-fonts";
import { useAuthentication } from "@/hooks/use-authentication";
import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";
import { getDeviceID } from '@/lib/device';

export function useAppInit() {
    const [, loadAssetsError] = useAssets(Object.values(assets));
    const { fontsLoaded, loadFontsErrors, } = useFonts();

    const { databaseLoaded, loadDatabaseErrors, } = useDatabase();
    const { authInfoLoaded, loadAuthInfoErrors, ...authInfo } = useAuthentication();

    const [{ configurationErrors, configured, }, setConfigState] = useState({
        configured: false,
        configurationErrors: [] as string[],
    });

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

    useEffect(() => {
        if (initialised && !initialiseErrors.length) sync();
    }, [initialised, initialiseErrors, sync]);

    useEffect(() => {
        (async () => {
            const errors: string[] = [];
            try {
                const initialSetupDate = await AsyncStorage.getItem(asyncStorageKeys.INITIAL_SETUP_DATE);

                if (!initialSetupDate) {
                    const deviceId = await getDeviceID();
                    await AsyncStorage.setItem(asyncStorageKeys.DEVICE_ID, deviceId);

                    await AsyncStorage.setItem(asyncStorageKeys.APP_VERSION, APP_VERSION);
                    await AsyncStorage.setItem(asyncStorageKeys.SDK_VERSION, SDK_VERSION);
                    await AsyncStorage.setItem(asyncStorageKeys.SESSIONS_COUNT, '0');

                    const activeSite = CONFIG.sites[0];
                    if (!activeSite) throw new Error('Sites not configured');
                    
                    await AsyncStorage.setItem(asyncStorageKeys.WEBEDITOR_URL, activeSite.webeditorURL);
                    await AsyncStorage.setItem(asyncStorageKeys.WEBEDITOR_API_KEY, activeSite.apiKey);
                    await AsyncStorage.setItem(asyncStorageKeys.COUNTRY_ISO, activeSite.countryISO);

                    await AsyncStorage.setItem(asyncStorageKeys.INITIAL_SETUP_DATE, new Date().toUTCString());
                }
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

    return {
        isReady,
        errors,
        ...authInfo,
    };
}

import { useEffect, useMemo } from "react";
import { useAssets } from "expo-asset";

import { assets } from "@/constants";
import { useDatabase } from "@/hooks/use-database";
import { useFonts } from "@/hooks/use-fonts";
import { useAuthentication } from "@/hooks/use-authentication";
import { useDeviceId } from "@/hooks/use-device-id";
import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";

export function useAppInit() {
    const [, loadAssetsError] = useAssets(Object.values(assets));
    const { fontsLoaded, loadFontsErrors, } = useFonts();

    const { databaseLoaded, loadDatabaseErrors, } = useDatabase();
    const { authInfoLoaded, loadAuthInfoErrors, ...authInfo } = useAuthentication();
    const { deviceId, deviceIdLoaded, loadDeviceIdErrors, } = useDeviceId();

    const { remotedSynced, syncRemoteErrors, sync } = useSyncRemoteData({ syncOnmount: false, });

    const initialised = useMemo(() => !!(
        authInfoLoaded && 
        fontsLoaded &&
        databaseLoaded &&
        deviceIdLoaded
    ),
    [
        authInfoLoaded, 
        fontsLoaded,
        databaseLoaded,
        deviceIdLoaded,
    ]);

    const initialiseErrors = useMemo(() => [
        ...(loadFontsErrors || []),
        ...(loadAuthInfoErrors || []),
        ...(loadDatabaseErrors || []),
        ...(loadDeviceIdErrors || []),
        ...(loadAssetsError ? [loadAssetsError.message] : []),
    ], [
        loadFontsErrors, 
        loadAuthInfoErrors,
        loadDatabaseErrors,
        loadDeviceIdErrors,
        loadAssetsError,
    ]);

    const errors = useMemo(() => [
        ...initialiseErrors,
        ...(syncRemoteErrors || []),
    ], [initialiseErrors, syncRemoteErrors]);

    const isReady = useMemo(() => remotedSynced && initialised, [initialised, remotedSynced]);

    useEffect(() => {
        if (initialised && !initialiseErrors) sync();
    }, [initialised, initialiseErrors, sync]);

    return {
        isReady,
        deviceId,
        errors,
        ...authInfo,
    };
}

import { useEffect, useMemo } from "react";
import { useAssets } from "expo-asset";

import { assets } from "@/constants";
import { useDatabase } from "./use-database";
import { useFonts } from "./use-fonts";
import { useAuthentication } from "./use-authentication";
import { useDeviceId } from "./use-device-id";

export function useAppInit(options?: {
    onInitialised?: () => void;
    onInitialisedWithoutErrors?: () => void;
}) {
    const { onInitialised, onInitialisedWithoutErrors } = { ...options, };

    const [, loadAssetsError] = useAssets(Object.values(assets));

    const { databaseLoaded, loadDatabaseErrors, } = useDatabase();
    const { fontsLoaded, loadFontsErrors, } = useFonts();
    const { authInfoLoaded, loadAuthInfoErrors, ...authInfo } = useAuthentication();
    const { deviceId, deviceIdLoaded, loadDeviceIdErrors, } = useDeviceId();

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

    const appErrors = useMemo(() => [
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

    useEffect(() => { 
        if (initialised) {
            onInitialised?.(); 
            if (!appErrors.length) onInitialisedWithoutErrors?.();
        }
    }, [initialised, appErrors, onInitialised, onInitialisedWithoutErrors]);

    return {
        initialised,
        deviceId,
        errors: appErrors,
        ...authInfo,
    };
}

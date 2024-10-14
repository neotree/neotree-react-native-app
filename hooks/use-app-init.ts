import { useEffect, useMemo } from "react";

import { useDatabase } from "./use-database";
import { useFonts } from "./use-fonts";
import { useAuthentication } from "./use-authentication";
import { useDeviceId } from "./use-device-id";

export function useAppInit(options?: {
    onIsReady?: () => void;
    onIsReadyWithoutErrors?: () => void;
}) {
    const { onIsReady, onIsReadyWithoutErrors } = { ...options, };

    const { databaseLoaded, loadDatabaseErrors, } = useDatabase();
    const { fontsLoaded, loadFontsErrors, } = useFonts();
    const { authInfoLoaded, loadAuthInfoErrors, ...authInfo } = useAuthentication();
    const { deviceId, deviceIdLoaded, loadDeviceIdErrors, } = useDeviceId();

    const isReady = useMemo(() => !!(
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
    ], [
        loadFontsErrors, 
        loadAuthInfoErrors,
        loadDatabaseErrors,
        loadDeviceIdErrors,
    ]);

    useEffect(() => { 
        if (isReady) {
            onIsReady?.(); 
            if (!appErrors.length) onIsReadyWithoutErrors?.();
        }
    }, [isReady, appErrors, onIsReady, onIsReadyWithoutErrors]);

    return {
        isReady,
        deviceId,
        errors: appErrors,
        ...authInfo,
    };
}

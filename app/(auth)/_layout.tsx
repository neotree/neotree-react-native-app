import { useCallback } from "react";
import { Redirect, Stack, useFocusEffect } from "expo-router";

import { useHospitals } from "@/hooks/use-hospitals";
import { useAuthentication } from "@/hooks/use-authentication";
import { useNetInfo } from "@/hooks/use-netinfo";

export default function AuthLayout() {
    const { getHospitals } = useHospitals();
    const { authenticated, authInfoLoaded } = useAuthentication();
    const { hasInternet } = useNetInfo();

    useFocusEffect(useCallback(() => {
        if (hasInternet && authInfoLoaded && !authenticated) getHospitals();
    }, [authInfoLoaded, authenticated, hasInternet, getHospitals]))

    if (!authInfoLoaded) return null;

    if (authenticated) return <Redirect href="/(drawer)" />;

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen 
                name="index"
            />

            <Stack.Screen 
                name="login"
            />
        </Stack>
    );
}

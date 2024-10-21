import { useEffect } from "react";
import { Redirect, Stack } from "expo-router";

import { useHospitals } from "@/hooks/use-hospitals";
import { useAuthentication } from "@/hooks/use-authentication";
import { useNetInfo } from "@/hooks/use-netinfo";

export default function AuthLayout() {
    const { hospitalsInitialised, getHospitals } = useHospitals();
    const { authenticated, authInfoLoaded } = useAuthentication();
    const { hasInternet } = useNetInfo();

    useEffect(() => {
        if (hasInternet && authInfoLoaded && !authenticated) getHospitals();
    }, [authInfoLoaded, authenticated, hasInternet, getHospitals]);

    if (!authInfoLoaded) return null;

    if (authenticated) return <Redirect href="/(drawer)" />;

    if (!hospitalsInitialised) return null;

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

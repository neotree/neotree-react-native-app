import { useCallback } from "react";
import { Redirect, Stack, useFocusEffect } from "expo-router";

import { useHospitals } from "@/hooks/use-hospitals";
import { useAuthentication } from "@/hooks/use-authentication";
import { useNetInfo } from "@/hooks/use-netinfo";
import { useAsyncStorage } from "@/hooks/use-async-storage";

export default function AuthLayout() {
    const { getHospitals } = useHospitals();
    const { authenticated, authInfoLoaded } = useAuthentication();
    const { hasInternet } = useNetInfo();
    const { ONBOARDING_DATE } = useAsyncStorage();

    useFocusEffect(useCallback(() => {
        if (hasInternet && authInfoLoaded && !authenticated) getHospitals();
    }, [authInfoLoaded, authenticated, hasInternet, getHospitals]))

    if (!authInfoLoaded) return null;

    if (authenticated) return <Redirect href={ONBOARDING_DATE ? '/(drawer)' : '/(auth)/welcome'} />;

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
                name="welcome"
            />

            <Stack.Screen 
                name="sign-in"
            />

            <Stack.Screen 
                name="sign-up"
            />

            <Stack.Screen 
                name="verify-email"
            />
        </Stack>
    );
}

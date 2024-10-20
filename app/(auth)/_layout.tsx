import { useEffect } from "react";
import { Redirect, Stack } from "expo-router";

import { useHospitals } from "@/hooks/use-hospitals";
import { useAuthentication } from "@/hooks/use-authentication";

export default function AuthLayout() {
    const { hospitalsInitialised } = useHospitals();
    const { authenticated, authInfoLoaded } = useAuthentication();

    useEffect(() => {
        if (authInfoLoaded && !authenticated) useHospitals.getState().getHospitals();
    }, [authInfoLoaded, authenticated]);

    if (!authInfoLoaded) return null;

    if (authenticated) return <Redirect href="(drawer)" />;

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

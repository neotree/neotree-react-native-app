import { Stack } from "expo-router";
import { useHospitalsInitialiser } from "@/hooks/use-hospitals";

export default function AuthLayout() {
    useHospitalsInitialiser();

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

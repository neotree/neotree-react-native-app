import { Stack } from "expo-router";
import { AuthContextProvider } from "@/contexts/auth";

export default function AuthLayout() {
    return (
        <AuthContextProvider>
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
        </AuthContextProvider>
    );
}

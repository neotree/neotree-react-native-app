import { AuthLayout } from '@/modules/auth/ui/layouts/auth-layout';
import { Stack } from 'expo-router';

export default function AuthRootLayout() {
    return (
        <>
            <AuthLayout>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="index" />         
                    <Stack.Screen name="sign-in" />
                    <Stack.Screen name="sign-up" />
                </Stack>
            </AuthLayout>
        </>
    );
}

import { SessionsLayout } from "@/modules/sessions/ui/layouts/sessions-layout";
import { Stack } from 'expo-router';

export default function SessionsRootLayout() {
    return (
        <>
            <SessionsLayout>
                <Stack>
                    <Stack.Screen 
                        name="index" 
                        options={{ 
                            headerShown: true,
                        }} 
                    />

                    <Stack.Screen 
                        name="session" 
                        options={{ 
                            headerShown: true,
                        }} 
                    />
                </Stack>
            </SessionsLayout>
        </>
    );
}

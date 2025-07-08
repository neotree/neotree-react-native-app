import { ScriptLayout } from "@/modules/scripts/ui/layouts/script-layout";
import { Stack } from 'expo-router';

export default function ScriptRootLayout() {
    return (
        <>
            <ScriptLayout>
                <Stack>
                    <Stack.Screen 
                        name="index" 
                        options={{ 
                            headerShown: true,
                        }} 
                    />
                </Stack>
            </ScriptLayout>
        </>
    );
}

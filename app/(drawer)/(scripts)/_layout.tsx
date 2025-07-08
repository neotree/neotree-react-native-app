import { ScriptsLayout } from "@/modules/scripts/ui/layouts/scripts-layout";
import { Stack } from 'expo-router';

export default function ScriptsRootLayout() {
    return (
        <>
            <ScriptsLayout>
                <Stack>
                    <Stack.Screen 
                        name="index" 
                        options={{ 
                            headerShown: true,
                        }} 
                    />

                    <Stack.Screen 
                        name="script" 
                        options={{ 
                            headerShown: true,
                        }} 
                    />
                </Stack>
            </ScriptsLayout>
        </>
    );
}

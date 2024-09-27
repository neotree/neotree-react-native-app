import { Stack, SplashScreen } from "expo-router";

import { useAppInit } from "@/hooks/use-app-init";
import { AppContextProvider } from "@/contexts/app";
import { AppErrors } from "@/components/app-errors";

SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
    const appData = useAppInit();

    const { isReady, errors } = appData;

    if (!isReady) return null;

    if (errors.length) return <AppErrors errors={errors} />

    return (
        <AppContextProvider {...appData}>
            <Stack>
                <Stack.Screen 
                    name="index" 
                    options={{
                        headerShown: true,
                        title: 'Scripts',
                    }}
                />

                <Stack.Screen 
                    name="(auth)" 
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </AppContextProvider>
    );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from "expo-router";
import { Drawer } from 'expo-router/drawer';

import { useAppInit } from "@/hooks/use-app-init";
import { AppContextProvider } from "@/contexts/app";
import { AppErrors } from "@/components/app-errors";

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const appData = useAppInit();

    const { isReady, errors } = appData;

    if (!isReady) return null;

    if (errors.length) return <AppErrors errors={errors} />

    return (
        <AppContextProvider {...appData}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack>
                    <Stack.Screen 
                        name="(main)" 
                        options={{
                            headerShown: false,
                            title: 'Scripts',
                        }}
                    />

                    <Stack.Screen 
                        name="(auth)" 
                        options={{
                            headerShown: false,
                        }}
                    />

                    <Stack.Screen 
                        name="script/[scriptId]" 
                        options={{
                            headerShown: true,
                        }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </AppContextProvider>
    );
}

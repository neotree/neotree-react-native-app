import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from "expo-router";

import { useAppInit } from "@/hooks/use-app-init";
import { AppContextProvider } from "@/contexts/app";
import { AppErrors } from "@/components/app-errors";
import { ConfirmModal } from '@/components/modals/confirm';
import { AlertModal } from '@/components/modals/alert';
import config from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const appData = useAppInit();

    const { isReady, errors } = appData;

    if (!isReady) return null;

    if (errors.length) return <AppErrors errors={errors} />

    return (
        <AppContextProvider {...appData}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ConfirmModal />
                <AlertModal />

                <Stack
                    screenOptions={{
                        headerTintColor: config.colors.primary.DEFAULT,
                    }}
                >
                    <Stack.Screen 
                        name="(drawer)" 
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
                        options={props => {
                            const params = props.route.params as { title: string; scriptId: string; };
                            return {
                                headerShown: true,
                                title: params.title || '',
                            };
                        }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </AppContextProvider>
    );
}

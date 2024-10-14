import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from "expo-router";

import { useTheme } from '@/hooks/use-theme';
import { useAppInit } from "@/hooks/use-app-init";
import { AppContextProvider } from "@/contexts/app";
import { AppErrors } from "@/components/app-errors";
import { ConfirmModal } from '@/components/modals/confirm';
import { AlertModal } from '@/components/modals/alert';
import { useSyncRemote } from '@/hooks/use-sync-remote';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const theme = useTheme();

    const { remotedSynced, syncRemoteErrors = [], sync } = useSyncRemote({ syncOnmount: false, });
    const appData = useAppInit({
        onIsReadyWithoutErrors: sync, // we want to sync when the app is ready
    });

    const { isReady, errors, authenticated } = appData;

    useEffect(() => {
        if (isReady && remotedSynced) SplashScreen.hideAsync();
    }, [isReady, remotedSynced]);

    const allErrors = [...errors, ...syncRemoteErrors];

    if (!isReady) return null;

    if (allErrors.length) return <AppErrors errors={allErrors} />;

    return (
        <AppContextProvider {...appData}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ConfirmModal />
                <AlertModal />

                <Stack
                    initialRouteName={authenticated ? '(drawer)' : '(auth)'}
                    screenOptions={{
                        headerTintColor: theme.primaryColor,
                        headerShown: false,
                    }}
                >
                    <Stack.Screen 
                        name="(drawer)" 
                        options={{
                            title: 'Scripts',
                        }}
                    />

                    <Stack.Screen 
                        name="(auth)" 
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

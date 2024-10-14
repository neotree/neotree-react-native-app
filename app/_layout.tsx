import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from "expo-router";
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppInit } from "@/hooks/use-app-init";
import { AppContextProvider } from "@/contexts/app";
import { AppErrors } from "@/components/app-errors";
import { ConfirmModal } from '@/components/modals/confirm';
import { AlertModal } from '@/components/modals/alert';
import { useSyncRemote } from '@/hooks/use-sync-remote';
import { Splash } from '@/components/splash';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const theme = useTheme();

    const { remotedSynced, syncRemoteErrors = [], sync } = useSyncRemote({ syncOnmount: false, });
    const appData = useAppInit({
        onInitialisedWithoutErrors: sync, // we want to sync when the app is ready
    });

    const { initialised, errors, authenticated } = appData;

    const appIsReady = useMemo(() => initialised && remotedSynced, [initialised, remotedSynced]);

    useEffect(() => {
        if (appIsReady) SplashScreen.hideAsync();
    }, [appIsReady]);

    const allErrors = [...errors, ...syncRemoteErrors];

    if (!appIsReady) return null;

    if (allErrors.length) {
        return (
            <Splash>
                <View className="gap-y-2 items-center">
                    <Text className="text-lg text-danger">Failed to initialise app</Text>

                    <Collapsible>
                        {({ isOpen }) => (
                            <>
                                <CollapsibleTrigger>
                                    <TouchableOpacity className={isOpen ? 'hidden' : ''}>
                                        <Text>View errors</Text>
                                    </TouchableOpacity>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <Text className="text-sm text-danger">{allErrors.join(', ')}</Text>
                                </CollapsibleContent>
                            </>
                        )}
                    </Collapsible>
                </View>
            </Splash>
        );
    }

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

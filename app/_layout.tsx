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
import { useSyncRemoteData } from '@/hooks/use-sync-remote-data';
import { Splash } from '@/components/splash';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const theme = useTheme();

    const appData = useAppInit();
    const { isReady, errors, authenticated } = appData;

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    if (!isReady) return null;

    if (errors.length) {
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
                                    <Text className="text-sm text-danger">{errors.join(', ')}</Text>
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

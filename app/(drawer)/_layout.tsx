
import { useCallback, useMemo } from 'react';
import { ToastAndroid, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';

import { useTheme } from '@/hooks/use-theme';
import { DrawerContent } from '@/components/drawer-content';
import { SocketEventsListener } from '@/components/socket-events-listener';
import { useSyncRemoteData } from '@/hooks/use-sync-remote-data';
import { Text } from '@/components/ui/text';
import { useNetInfo } from '@/hooks/use-netinfo';

export default function MainLayout() {
    const theme = useTheme();

    const { remoteSyncQueue, sync } = useSyncRemoteData();
    const { hasInternet } = useNetInfo();

    const onRemoteDataChange = useCallback(() => {
        if (hasInternet) {
            if (!remoteSyncQueue) {
                ToastAndroid.show(
                    'Webeditor updated, syncing...',
                    ToastAndroid.SHORT,
                );
            }
            sync();
        }
    }, [hasInternet, remoteSyncQueue, sync]);

    const socketEvents = useMemo(() => [
        {
            name: 'data_changed',
            onEvent: { callback: onRemoteDataChange, },
        },
    ], [onRemoteDataChange]);

    return (
        <>
            <SocketEventsListener events={socketEvents} />

            <View className="flex-1">
                <Drawer
                    drawerContent={props => <DrawerContent drawerContentComponentProps={props} />}
                    screenOptions={{
                        headerTintColor: theme.primaryColor,
                        headerShown: false,
                    }}
                >
                    <Drawer.Screen
                        name="index"
                        options={{
                            drawerLabel: 'Home',
                            title: 'Scripts',
                        }}
                    />

                    <Drawer.Screen
                        name="configuration"
                        options={{
                            drawerLabel: 'Configuration',
                            title: 'Configuration',
                        }}
                    />

                    <Drawer.Screen
                        name="history"
                        options={{
                            drawerLabel: 'History',
                            title: 'Session history',
                        }}
                    />

                    <Drawer.Screen
                        name="location"
                        options={{
                            drawerLabel: 'Location',
                            title: 'Location',
                        }}
                    />

                    <Drawer.Screen
                        name="qrcode"
                        options={{
                            drawerLabel: 'QR Code',
                            title: 'QR Code',
                        }}
                    />
                </Drawer>
            </View>

            {!hasInternet && (
                <View className="p-[0.5] items-center justify-center bg-gray-300">
                    <Text className="text-xs text-gray-700">Offline</Text>
                </View>
            )}
        </>
    );
}

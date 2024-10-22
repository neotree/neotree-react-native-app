
import { useCallback, useMemo } from 'react';
import { ToastAndroid } from 'react-native';
import { Drawer } from 'expo-router/drawer';

import { useTheme } from '@/hooks/use-theme';
import { DrawerContent } from '@/components/drawer-content';
import { SocketEventsListener } from '@/components/socket-events-listener';
import { useSyncRemoteData } from '@/hooks/use-sync-remote-data';

export default function MainLayout() {
    const theme = useTheme();

    const { remoteSyncQueue, sync } = useSyncRemoteData();

    const onRemoteDataChange = useCallback(() => {
        if (!remoteSyncQueue) {
            ToastAndroid.show(
                'Webeditor updated, syncing...',
                ToastAndroid.SHORT,
            );
        }
        sync();
    }, [remoteSyncQueue, sync]);

    const socketEvents = useMemo(() => [
        {
            name: 'data_changed',
            onEvent: { callback: onRemoteDataChange, },
        },
    ], [onRemoteDataChange]);

    return (
        <>
            <SocketEventsListener events={socketEvents} />

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
        </>
    );
}

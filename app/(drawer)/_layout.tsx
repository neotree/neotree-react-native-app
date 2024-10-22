import { Drawer } from 'expo-router/drawer';

import { useTheme } from '@/hooks/use-theme';
import { DrawerContent } from '@/components/drawer-content';

export default function MainLayout() {
    const theme = useTheme();

    return (
        <>
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

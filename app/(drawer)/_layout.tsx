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
                    name="history"
                    options={{
                        drawerLabel: 'History',
                        title: 'History',
                    }}
                />
            </Drawer>
        </>
    );
}

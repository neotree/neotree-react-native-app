import { DrawerContent } from '@/components/drawer-content';
import { Drawer } from 'expo-router/drawer';

export default function MainLayout() {
    return (
        <>
            <Drawer
                drawerContent={props => <DrawerContent drawerContentComponentProps={props} />}
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

import { Drawer } from 'expo-router/drawer';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Layout() {
    const colorScheme = useColorScheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                screenOptions={{
                    drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                    drawerStyle: Platform.select({
                        ios: {
                            // Use a transparent background on iOS to show the blur effect
                            position: 'absolute',
                        },
                        default: {},
                    }),
                }}
            >
                <Drawer.Screen
                    name="(scripts)"
                    options={{
                        title: 'Scripts',
                        drawerLabel: 'Scripts',
                        drawerIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                    }}
                />
                
                <Drawer.Screen
                    name="sessions"
                    options={{
                        title: 'Sessions',
                        drawerLabel: 'History',
                        drawerIcon: ({ color }) => <IconSymbol size={28} name="clock.circle.fill" color={color} />,
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}

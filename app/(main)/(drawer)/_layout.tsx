import {
	DrawerContentScrollView,
	DrawerItemList,
	type DrawerContentComponentProps
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import THEME from '@/constants/theme';
import { useAppContext } from '@/contexts/app';
import { cn } from '@/lib/utils';

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                drawerInactiveTintColor: THEME.colors.muted.foreground,
                drawerActiveTintColor: THEME.colors.primary.DEFAULT,
            }}
            drawerContent={DrawerContent}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: 'Home',
                    drawerIcon: ({ color }) => <Icon size={28} name="house" color={color} />,
                    drawerLabel: props => <DrawerLabel {...props} label="Home" />
                }}
            />

            <Drawer.Screen
                name="config-keys"
                options={{
                    title: 'Configuration',
                    drawerIcon: ({ color }) => <Icon size={28} name="settings" color={color} />,
                    drawerLabel: props => <DrawerLabel {...props} label="Configuration" />
                }}
            />

            <Drawer.Screen
                name="sessions-history"
                options={{
                    title: 'History',
                    drawerIcon: ({ color }) => <Icon size={28} name="history" color={color} />,
                    drawerLabel: props => <DrawerLabel {...props} label="History" />
                }}
            />

            <Drawer.Screen
                name="location-settings"
                options={{
                    title: 'Location',
                    drawerIcon: ({ color }) => <Icon size={28} name="location-pin" color={color} />,
                    drawerLabel: props => <DrawerLabel {...props} label="Location" />
                }}
            />
        </Drawer>
    );
}

function DrawerContent(props: DrawerContentComponentProps) {
    const { signOut } = useAppContext();

    return (
        <SafeAreaView className="flex-1">
            <DrawerContentScrollView {...props}>
                <View className="items-center">
                    <Logo />
                </View>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <View className="justify-end p-5 border-t border-border">
                <TouchableOpacity
                    className="flex-row items-center gap-x-4 rounded-full bg-muted px-6 py-5"
                    onPress={() => {
                        signOut();
                        router.replace('/(auth)');
                    }}
                >
                    <Icon name="logout" color={THEME.colors.muted.foreground} />
                    <DrawerLabel label="Logout" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function DrawerLabel({ focused, label }: {
    focused?: boolean;
    label: string;
}) {
    return (
        <Typography
            className={cn(
                focused ? 'text-primary' : 'text-muted-foreground',
            )}
        >
            {label}
        </Typography>
    );
}

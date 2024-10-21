import React, { Fragment } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import Constants from 'expo-constants';
import clsx from "clsx";
import { Href, router, usePathname } from "expo-router";

import { useAsyncStorage } from "@/hooks/use-async-storage";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Logo } from "@/components/logo";
import { Home } from "@/components/svgs/home";
import { Cogs } from "@/components/svgs/settings";
import { Clock } from "@/components/svgs/clock";
import { Logout } from "@/components/svgs/logout";
import { Location } from "@/components/svgs/Location";

const links: {
    label: string;
    href: Href<string>;
    path: string;
    Icon: React.ComponentType<{ className?: string; svgClassName?: string; }>;
}[] = [
    {
        label: 'Home',
        href: '/(drawer)',
        path: '/',
        Icon: Home,
    },
    {
        label: 'Configuration',
        href: '/(drawer)/configuration',
        path: '/configuration',
        Icon: Cogs,
    },
    {
        label: 'History',
        href: '/(drawer)/history',
        path: '/history',
        Icon: Clock,
    },
    {
        label: 'Location',
        href: '/(drawer)/location',
        path: '/location',
        Icon: Location,
    },
];

export function DrawerContent({ drawerContentComponentProps }: {
    drawerContentComponentProps: DrawerContentComponentProps;
}) {
    const pathname = usePathname();

    const { confirm, } = useConfirmModal();
    const { 
        WEBEDITOR_DATA_VERSION, 
        DEVICE_HASH, 
        DEVICE_ID, 
        HOSPITAL_NAME,
        COUNTRY_NAME,
        setItems: setAsyncStorageItem, 
    } = useAsyncStorage();

    return (
        <View 
            className="flex-1 bg-background"
            style={{ paddingTop: Constants.statusBarHeight, }}
        >
            <View className="h-48 items-center justify-center">
                <Logo />
            </View>

            <View className="flex-1 p-4">
                <ScrollView>
                    {links.map(({ Icon, label, href, path, }) => {
                        const isActive = pathname === path;

                        return (
                            <Fragment key={label}>
                                <TouchableOpacity
                                    className={clsx(
                                        'text-lg flex-row px-4 py-3 rounded-md items-center',
                                        isActive ? 'bg-primary-100' : '',
                                    )}
                                    onPress={() => {
                                        router.push(href);
                                    }}
                                >
                                    <>
                                        <Icon 
                                            svgClassName={clsx(
                                                'w-6 h-6 mr-4',
                                                isActive ? 'stroke-primary' : 'stroke-gray-950',
                                            )} 
                                        />

                                        <Text
                                            className={clsx(
                                                'uppercase font-bold',
                                                isActive ? 'text-primary' : 'text-gray-950',
                                            )}
                                        >{label}</Text>
                                    </>
                                </TouchableOpacity>
                            </Fragment>
                        )
                    })}
                </ScrollView>
            </View>

            <Separator />

            <View className="p-4">
                {[
                    ['Webeditor version', WEBEDITOR_DATA_VERSION],
                    ['Neotree ID HASH', DEVICE_HASH],
                    ['Device ID', DEVICE_ID],
                    ['Current hospital', [HOSPITAL_NAME, COUNTRY_NAME].filter(s => s).join(', ')],
                ].map(([label, value]) => {
                    return (
                        <View key={label} className="flex-row items-center">
                            <Text className="text-xs mr-2">{label}:</Text>
                            <Text numberOfLines={1} className="text-primary text-xs font-bold flex-1 text-right">
                                {value}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <Separator />

            <View className="p-4">
                <TouchableOpacity
                    className={clsx(
                        'text-lg flex-row px-4 py-3 rounded-md bg-danger/10 items-center',
                    )}
                    onPress={() => {
                        confirm(async () => {
                            await setAsyncStorageItem({ BEARER_TOKEN: '', });
                            router.push('/(auth)');
                        }, {
                            danger: true,
                            title: 'Logout',
                            message: 'Are you sure you want to logout?',
                            positiveLabel: 'Logout',
                            negativeLabel: 'Cancel',
                        });
                    }}
                >
                    <>
                        <Logout 
                            svgClassName={clsx(
                                'w-6 h-6 mr-4 stroke-danger',
                            )} 
                        />

                        <Text
                            className={clsx(
                                'uppercase font-bold text-danger',
                            )}
                        >Logout</Text>
                    </>
                </TouchableOpacity>
            </View>
        </View>
    );
}

import React, { Fragment } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import Constants from 'expo-constants';
import clsx from "clsx";
import { Href, router, usePathname } from "expo-router";

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
                                        'text-lg flex-row px-4 py-3 rounded-md',
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
                <TouchableOpacity
                    className={clsx(
                        'text-lg flex-row px-4 py-3 rounded-md bg-danger/10',
                    )}
                    onPress={() => {
                        
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

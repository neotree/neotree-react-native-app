import React, { Fragment, useCallback } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import Constants from 'expo-constants';
import clsx from "clsx";
import { router } from "expo-router";

import { useAsyncStorage } from "@/hooks/use-async-storage";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Logo } from "@/components/logo";
import { Logout } from "@/components/svgs/logout";
import { AppDetails } from "@/components/app-details";
import { useRoutes } from "@/hooks/use-routes";

export function DrawerContent({}: {
    drawerContentComponentProps: DrawerContentComponentProps;
}) {
    const routes = useRoutes();
    const { confirm, } = useConfirmModal();
    const { setItems: setAsyncStorageItem, } = useAsyncStorage();
    
    const logout = useCallback(() => {
        confirm(async () => {
            await setAsyncStorageItem({ 
                BEARER_TOKEN: '', 
                LAST_REMOTE_SYNC_DATE: '', // this will force a fresh data sync when we log back in
            });
            router.push('/(auth)');
        }, {
            danger: true,
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            positiveLabel: 'Logout',
            negativeLabel: 'Cancel',
        });
    }, [router.push, confirm, setAsyncStorageItem]);

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
                    {routes.map(({ Icon, label, href, isActive }) => {
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
                                                isActive ? 'stroke-primary' : 'stroke-gray-900',
                                            )} 
                                        />

                                        <Text
                                            className={clsx(
                                                'uppercase font-bold',
                                                isActive ? 'text-primary' : 'text-gray-900',
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
                <AppDetails />
            </View>

            <Separator />

            <View className="p-4">
                <TouchableOpacity
                    className={clsx(
                        'text-lg flex-row px-4 py-3 rounded-md bg-danger/10 items-center',
                    )}
                    onPress={() => logout()}
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

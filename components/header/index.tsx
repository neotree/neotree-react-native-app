import { useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import clsx from "clsx";
import Constants from 'expo-constants';
import { router, useNavigation, useFocusEffect } from "expo-router";

import { useHeader, HeaderState, defaultHeaderState, } from "@/hooks/use-header";
import { Text } from "@/components/ui/text";
import { Arrow } from "@/components/svgs/arrow";
import { Menu } from "@/components/svgs/menu";

function HeaderComponent() {
    const navigation = useNavigation<any>();
    const { ...state } = useHeader();

    const {
        title,
        subtitle,
        backButtonVisible,
        menuButtonVisible,
    } = state;

    return (
        <View
            className={clsx('flex-row items-center px-3 pb-2 bg-background border-b border-b-border')}
            style={[
                { 
                    paddingTop: Constants.statusBarHeight + 12, 
                    shadowColor: 'rgba(0,0,0,.1)',
                    shadowOffset: { width: -2, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 24,
                },
            ]}
        >
            {!!menuButtonVisible && (
                <TouchableOpacity
                    className="mr-3"
                    onPress={() => {
                        navigation?.openDrawer();
                    }}
                >
                    <Menu 
                        svgClassName="stroke-primary w-6 h-6"
                    />
                </TouchableOpacity>
            )}

            {!!backButtonVisible && (
                <TouchableOpacity
                    className="mr-3"
                    onPress={() => {
                        router.back();
                    }}
                >
                    <Arrow 
                        direction="left"
                        svgClassName="stroke-primary w-6 h-6"
                    />
                </TouchableOpacity>
            )}

            <View className="flex-1">
                <View>
                    <Text
                        className={clsx('text-primary text-xl')}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >{title}</Text>

                    {!!subtitle && (
                        <Text
                            className={clsx('opacity-50 text-sm')}
                            numberOfLines={1}
                        >{subtitle}</Text>
                    )}
                </View>
            </View>
        </View>
    );
}

export function Header(props: Partial<HeaderState> & {
    children?: React.ReactNode;
}) {
    const { setState, } = useHeader();

    useFocusEffect(useCallback(() => {
        setState({
            ...defaultHeaderState,
            ...props,
            node: props.children || null,
        });
        // return () => setState(defaultHeaderState);
    }, [props]));

    return <HeaderComponent />;
}

export function NativeStackHeader() {
    const { node } = useHeader();
    return node;
}
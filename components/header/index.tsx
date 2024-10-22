import { useCallback } from "react";
import { View } from "react-native";
import clsx from "clsx";
import Constants from 'expo-constants';
import { useFocusEffect } from "expo-router";

import { useHeader, HeaderState, defaultHeaderState, } from "@/hooks/use-header";
import { Text } from "@/components/ui/text";
import { BackButton } from "./back-button";
import { DrawerButton } from "./drawer-button";

function HeaderComponent() {
    const { ...state } = useHeader();

    const { title, subtitle } = state;

    return (
        <View
            className={clsx(
                'flex-row items-center px-3 pb-2 bg-background border-b border-b-border min-h-[100px]'
            )}
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
            <DrawerButton />

            <BackButton />

            <View className="flex-1">
                <View>
                    <Text
                        className={clsx('text-primary text-xl')}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >{title}</Text>

                    {!!subtitle && (
                        <Text
                            className={clsx('opacity-50 text-xs')}
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
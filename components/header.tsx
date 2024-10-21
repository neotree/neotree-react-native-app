import { View, TouchableOpacity } from "react-native";
import clsx from "clsx";
import Constants from 'expo-constants';
import { router } from "expo-router";

import { useHeader } from "@/hooks/use-header";
import { Text } from "@/components/ui/text";
import { Arrow } from "@/components/svgs/arrow";
import { useMemo } from "react";

type Props = {
    title: string;
    subtitle?: string;
    backButtonVisible?: boolean;
};

export function Header(props: Props) {
    const { ...state } = useHeader();

    const {
        title,
        subtitle,
        backButtonVisible,
    } = useMemo(() => {
        return {
            title: state.title || props.title, 
            subtitle: state.subtitle || props.subtitle, 
            backButtonVisible: state.backButtonVisible || props.backButtonVisible, 
        };
    }, [props, state]);

    return (
        <View
            className={clsx('flex-row items-center px-2 pb-2 bg-background border-b border-b-border')}
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
            {!!backButtonVisible && (
                <TouchableOpacity
                    className="mr-2"
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

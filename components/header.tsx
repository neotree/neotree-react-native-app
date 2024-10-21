import { View, Platform } from "react-native";
import clsx from "clsx";
import Constants from 'expo-constants';

import { useHeader } from "@/hooks/use-header";
import { Text } from "@/components/ui/text";

type Props = {
    title: string;
    subtitle?: string;
};

export function Header({ title, subtitle }: Props) {
    const state = useHeader();

    return (
        <View
            className={clsx('flex-row items-center px-4 pb-2 bg-background border-b border-b-border')}
            style={[
                { 
                    paddingTop: Constants.statusBarHeight + 12, 
                    shadowColor: 'rgba(0,0,0,.1)',
                    shadowOffset: { width: -2, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    // elevation: 24,
                },
                Platform.OS === 'android' && { elevation: 24, },
            ]}
        >
            <View className="flex-1">
                <View>
                    <Text
                        className={clsx('text-primary text-xl')}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >{title || state.title}</Text>

                    {!!subtitle && (
                        <Text
                            className={clsx('opacity-50 text-sm')}
                            numberOfLines={1}
                        >{subtitle || state.subtitle}</Text>
                    )}
                </View>
            </View>
        </View>
    );
}

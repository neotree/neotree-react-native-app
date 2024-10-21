import { View } from "react-native";
import { useLocalSearchParams, } from "expo-router";

import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";

export default function ScriptScreen() {
    const { title, subtitle } = useLocalSearchParams<{ title: string; subtitle: string; }>();

    return (
        <>
            <Header
                title={title}
                subtitle={subtitle}
                backButtonVisible
            />

            <View className="flex-1 items-center justify-center bg-background">
                <Text>Script</Text>
            </View>
        </>
    );
}

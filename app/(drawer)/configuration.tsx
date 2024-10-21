import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { Header } from "@/components/header";

export default function ConfigurationScreen() {
    return (
        <>
            <Header 
                backButtonVisible
                title="Configuration"
            />

            <View className="flex-1 items-center justify-center">
                <Text variant="title">Configuration</Text>
            </View>
        </>
    );
}

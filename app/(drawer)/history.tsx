import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { Header } from "@/components/header/index";

export default function HistoryScreen() {
    return (
        <>
            <Header 
                backButtonVisible
                title="Sessions history"
            />

            <View className="flex-1 items-center justify-center">
                <Text variant="title">Sessions history</Text>
            </View>
        </>
    );
}

import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { Header } from "@/components/header";

export default function LocationScreen() {
    return (
        <>
            <Header 
                backButtonVisible
                title="Location"
            />

            <View className="flex-1 items-center justify-center">
                <Text variant="title">Location</Text>
            </View>
        </>
    );
}

import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { Header } from "@/components/header/index";

export default function QrCodeScreen() {
    return (
        <>
            <Header 
                backButtonVisible
                title="QR Code"
            />

            <View className="flex-1 items-center justify-center">
                <Text variant="title">QR Code</Text>
            </View>
        </>
    );
}

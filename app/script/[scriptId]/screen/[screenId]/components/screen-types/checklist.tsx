import { View } from "react-native";

import { ScrollView } from "@/components/scroll-view";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";
import { ScreenDetails } from "../screen-details";
import { ScreenFAB } from "../screen-fab";

export function Checklist() {
    return (
        <View className="flex-1">
            <ScrollView>
                <ScreenDetails />

                <Content>
                    <Text>Checklist</Text>
                </Content>
            </ScrollView>
            
            <ScreenFAB />
        </View>
    );
}
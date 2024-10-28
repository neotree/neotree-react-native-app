import { ScrollView } from "@/components/scroll-view";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";
import { ScreenDetails } from "../screen-details";
import { ScreenFAB } from "../screen-fab";

export function Management() {
    return (
        <ScrollView minHeight="full">
            <ScreenDetails />

            <Content>
                <Text>Management</Text>
            </Content>

            <ScreenFAB />
        </ScrollView>
    );
}
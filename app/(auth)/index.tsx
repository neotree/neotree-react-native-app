import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Poster } from "@/components/poster";
import { Content } from "@/components/content";

export default function OnboardingScreen() {
    return (
        <Poster>
            <Content className="py-10">
                <Text>Hello!</Text>
                
                <Button
                    onPress={() => router.push('(auth)/login')}
                >
                    Continue
                </Button>
            </Content>
        </Poster>
    );
}

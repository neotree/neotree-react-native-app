import { View } from "react-native";
import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useHospitals } from "@/hooks/use-hospitals";
import { Poster } from "@/components/poster";
import { Content } from "@/components/content";

export default function OnboardingScreen() {
    return (
        <Poster>
            <Content>
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

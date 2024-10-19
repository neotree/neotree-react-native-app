import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Poster } from "@/components/poster";
import { Content } from "@/components/content";
import { useAsyncStorage } from "@/hooks/use-async-storage";

export default function OnboardingScreen() {
    const neotreeConst = useAsyncStorage();

    console.log(neotreeConst);

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

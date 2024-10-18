import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Poster } from "@/components/poster";
import { Content } from "@/components/content";
import { useNeotreeConstants } from "@/hooks/use-neotree-constants";

export default function OnboardingScreen() {
    const neotreeConst = useNeotreeConstants();

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

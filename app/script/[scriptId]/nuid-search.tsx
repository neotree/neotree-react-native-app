import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { ScriptRouteSearchParams } from "@/types";
import { useScript } from "@/hooks/script/use-script";
import ucFirst from "@/lib/ucFirst";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Content } from "@/components/content";
import { Header } from "@/components/header";
import { NEOTREE_ID_SEARCH } from "@/constants/copy";

export default function NuidSearchScreen() {
    const searchParams = useLocalSearchParams<ScriptRouteSearchParams>();

    const { script, } = useScript();

    return (
        <>
            <Header
                backButtonVisible
                title={NEOTREE_ID_SEARCH}
                subtitle={script!.title}
            />

            <ScrollView>
                <Content className="mt-5">
                    <Card>
                        <CardContent>
                            <Text>Nuid search</Text>
                        </CardContent>
                    </Card>
                </Content>
            </ScrollView>
        </>
    )
}
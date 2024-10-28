import { SafeAreaView, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { ScriptRouteSearchParams } from "@/types";
import { useScript } from "@/hooks/script/use-script";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Content } from "@/components/content";
import { Header } from "@/components/header";
import ucFirst from "@/lib/ucFirst";
import { Exclamation } from "@/components/svgs/exclamation";

export default function ScriptScreen() {
    const searchParams = useLocalSearchParams<ScriptRouteSearchParams>();

    const { script, } = useScript();

    if (script?.nuidSearchEnabled) {
        return (
            <Redirect 
                href={{
                    pathname: '/script/[scriptId]/nuid-search',
                    params: searchParams,
                }}
            />
        );
    }

    if (script?.screens?.length) {
        return (
            <Redirect 
                href={{
                    pathname: '/script/[scriptId]/screen/[screenId]',
                    params: {
                        ...searchParams,
                        screenId: script.screens[0].screenId,
                    },
                }}
            />
        );
    }

    return (
        <>
            <Header
                backButtonVisible
                title={script!.title}
                subtitle={ucFirst(script!.type)}
            />

            <SafeAreaView>
                <Content className="mt-5">
                    <Card>
                        <CardContent className="items-center justify-center">
                            <Exclamation 
                                svgClassName="w-20 h-20 mb-2 stroke-danger"
                            />
                            <Text className="text-center text-danger">Script does not have any screens</Text>
                        </CardContent>
                    </Card>
                </Content>
            </SafeAreaView>
        </>
    );
}

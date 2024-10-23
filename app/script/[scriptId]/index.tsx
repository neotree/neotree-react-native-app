import { View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { ScriptRouteSearchParams } from "@/types";
import { Header } from "@/components/header";
import { useScript } from "@/hooks/script/use-script";
import ucFirst from "@/lib/ucFirst";

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

    return (
        <>
            <Header
                backButtonVisible
                title={script!.title}
                subtitle={ucFirst(script!.type)}
            />

            <View className="flex-1">

            </View>
        </>
    );
}

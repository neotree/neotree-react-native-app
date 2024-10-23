import { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import clsx from "clsx";

import { Header } from "@/components/header/index";
import { Text } from "@/components/ui/text";
import { Loader } from "@/components/loader";
import { useScript } from "@/hooks/script/use-script";
import { useSession } from "@/hooks/session/use-session";
import { useIsScreenFocused } from "@/hooks/use-is-screen-focused";
import { ScriptRouteSearchParams } from "@/types";
import { Exclamation } from "@/components/svgs/exclamation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ucFirst from "@/lib/ucFirst";

export default function ScriptScreen() {
    const isFocused = useIsScreenFocused();

    const { 
        scriptId, 
        scriptTitle, 
        scriptSubtitle 
    } = useLocalSearchParams<ScriptRouteSearchParams>();

    const { 
        script,
        scriptInitialised,
        scriptErrors,
        scriptLoading, 
        getScript, 
        reset: resetScriptState, 
    } = useScript();

    const { 
        reset: resetSessionState, 
    } = useSession();

    useEffect(() => {
        if (isFocused) {
            getScript(scriptId);
        }

        return () => {
            resetScriptState();
            resetSessionState();
        };
    }, [isFocused, scriptId, getScript, resetScriptState, resetSessionState]);

    if (!isFocused) return null;

    if (!scriptInitialised || scriptLoading) return <Loader overlay overlayTransparent={false} />;

    if (!script || scriptErrors?.length) {
        return (
            <View className="flex-1 items-center justify-center">
                <Content>
                    <Card>
                        <CardContent className="items-center">
                            <Exclamation 
                                svgClassName={clsx(
                                    'stroke-gray-400 w-20 h-20 mb-5',
                                    scriptErrors?.length && 'stroke-danger',
                                )}
                            />

                            <Text className={clsx('text-lg mb-5 text-center', scriptErrors?.length && 'text-danger')}>
                                {scriptErrors?.length ? `Failed to load script: ${scriptTitle}` : `Script (${scriptTitle}) not found`}
                            </Text>

                            {!!scriptErrors?.length && (
                                <View className="mb-5">
                                    <Collapsible>
                                        {({ isOpen }) => (
                                            <>
                                                <CollapsibleTrigger>
                                                    <TouchableOpacity className={clsx(isOpen ? 'hidden' : '')}>
                                                        <Text className="text-sm text-center">View errors</Text>
                                                    </TouchableOpacity>
                                                </CollapsibleTrigger>
                    
                                                <CollapsibleContent>
                                                    <Text className="text-sm text-danger text-center">{scriptErrors.join(', ')}</Text>
                                                </CollapsibleContent>
                                            </>
                                        )}
                                    </Collapsible>
                                </View>
                            )}

                            <View className="flex-row justify-center">
                                <Button
                                    variant="ghost"
                                    onPress={() => router.push('/(drawer)')}
                                >Go back</Button>

                                <Button
                                    onPress={() => getScript(scriptId, { reset: true, })}
                                >
                                    Retry
                                </Button>
                            </View>
                        </CardContent>
                    </Card>
                </Content>
            </View>
        );
    }

    return (
        <>
            <Header
                backButtonVisible
                title={script.title}
                subtitle={ucFirst(script.type)}
            />

            <View className="flex-1">
                
            </View>
        </>
    );
}

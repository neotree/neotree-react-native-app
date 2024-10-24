import { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { router, useFocusEffect } from "expo-router";

import { resetStore } from '@/store';
import { useNetInfo } from '@/hooks/use-netinfo';
import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";
import { Loader } from "@/components/loader";
import { Poster } from "@/components/poster";
import { Text } from "@/components/ui/text";
import { Exclamation } from "@/components/svgs/exclamation";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { WifiOff } from "@/components/svgs/wifi-off";

export default function WelcomeScreen() {
    const { hasInternet } = useNetInfo();
    const { syncRemoteErrors, sync } = useSyncRemoteData();

    const setup = useCallback(async () => {
        await sync({ force: true, clearData: true, });
        await resetStore();
    }, [router.push, sync]);

    useFocusEffect(useCallback(() => { 
        if (hasInternet) setup(); 
    }, [hasInternet, setup]));

    let children = (
        <>
            <Loader />
            <Text className="mt-2 text-xs">Setting up the app, please wait...</Text>
        </>
    );

    if (syncRemoteErrors?.length) {
        children = (
            <>
                <Exclamation svgClassName="w-10 h-10 stroke-danger" />
                <Text className="mt-2 text-lg text-danger">Failed to setup up the app</Text>

                <Collapsible>
                    {({ isOpen }) => (
                        <>
                            <CollapsibleTrigger>
                                <TouchableOpacity className={isOpen ? 'hidden' : ''}>
                                    <Text>View errors</Text>
                                </TouchableOpacity>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <Text className="text-sm text-danger">{syncRemoteErrors.join(', ')}</Text>
                            </CollapsibleContent>
                        </>
                    )}
                </Collapsible>

                <View className="flex-row items-center justify-center mt-5">
                    <Button>Try again!</Button>
                </View>
            </>
        );
    }

    if (!hasInternet) {
        children = (
            <View>
                <WifiOff svgClassName="w-10 h-10 stroke-gray-400" />
                <Text className="mt-2 text-xs text-gray-400">No internet</Text>
            </View>
        );
    }

    return (
        <>
            <Poster>
                {children}
            </Poster>
        </>
    );
}
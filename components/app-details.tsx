import React from "react";
import { View } from "react-native";

import { useAsyncStorage } from "@/hooks/use-async-storage";
import { Text } from "@/components/ui/text";

export function AppDetails() {
    const { 
        APP_VERSION,
        NEOTREE_BUILD_TYPE,
        WEBEDITOR_DATA_VERSION, 
        DEVICE_HASH, 
        DEVICE_ID, 
        HOSPITAL_NAME,
        COUNTRY_NAME,
    } = useAsyncStorage();

    return (
        <>
            {[
                ['App version', [
                    APP_VERSION, 
                    { development: '(DEV)', demo: '(DEMO)', stage: '(STAGE)', }[NEOTREE_BUILD_TYPE as string] || ''
                ].filter(s => s).join(' ')],
                ['Webeditor version', WEBEDITOR_DATA_VERSION],
                ['Neotree ID HASH', DEVICE_HASH],
                ['Device ID', DEVICE_ID],
                ['Current hospital', [HOSPITAL_NAME, COUNTRY_NAME].filter(s => s).join(', ')],
            ].map(([label, value]) => {
                return (
                    <View key={label} className="flex-row items-center">
                        <Text className="text-xs mr-2">{label}:</Text>
                        <Text numberOfLines={1} className="text-primary text-xs font-bold flex-1 text-right">
                            {value}
                        </Text>
                    </View>
                );
            })}
        </>
    );
}

import { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { useHeader, } from "@/hooks/use-header";
import { Arrow } from "@/components/svgs/arrow";

export function BackButton() {
    const { backButtonVisible, onBackButtonPress } = useHeader();

    const goBack = useCallback(() => {
        router.back();
    }, [router.back]);

    const onPress = useCallback(() => {
        if (onBackButtonPress) {
            onBackButtonPress(goBack);
        } else {
            goBack();
        }
    }, [goBack, onBackButtonPress]);

    if (!backButtonVisible) return null;

    return (
        <TouchableOpacity
            className="mr-3"
            onPress={onPress}
        >
            <Arrow 
                direction="left"
                svgClassName="stroke-primary w-6 h-6"
            />
        </TouchableOpacity>
    );
}

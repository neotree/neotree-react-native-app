import { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";

import { useHeader } from "@/hooks/use-header";
import { Menu } from "@/components/svgs/menu";

export function DrawerButton() {
    const navigation = useNavigation<any>();
    const { menuButtonVisible } = useHeader();

    const onPress = useCallback(() => {
        navigation?.openDrawer();
    }, [navigation?.openDrawer]);

    if (!menuButtonVisible) return null;

    return (
        <TouchableOpacity
            className="mr-3"
            onPress={onPress}
        >
            <Menu 
                svgClassName="stroke-primary w-6 h-6"
            />
        </TouchableOpacity>
    );
}

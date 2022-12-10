import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";

export function useBackButton(cb: () => void) {
    function backButtonClick() {
        cb();
        return true;
    }

    useFocusEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', backButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', backButtonClick);
        };
   });
}

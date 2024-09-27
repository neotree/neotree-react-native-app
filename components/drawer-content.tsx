import { Text, View } from "react-native";
import { Drawer,  } from 'expo-router/drawer';
import { DrawerContentComponentProps } from "@react-navigation/drawer";

export function DrawerContent({}: {
    drawerContentComponentProps: DrawerContentComponentProps;
}) {
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            
        </View>
    );
}

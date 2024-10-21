import { Stack } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { NativeStackHeader } from "@/components/header/index";

export default function ScriptLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={({ route }) => {
                const { title, } = { ...route.params } as { title: string; };
                return {
                    headerTintColor: theme.primaryColor,
                    headerShown: true,
                    title: title || '',
                    headerBackVisible: false,
                    header: () => <NativeStackHeader />,
                };
            }}
        >
            <Stack.Screen 
                name="index"
            />
        </Stack>
    );
}

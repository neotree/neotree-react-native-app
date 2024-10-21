import { Stack } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function ScriptLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={({ route }) => {
                const { title, subtitle, } = { ...route.params } as { title: string; subtitle: string; };
                return {
                    headerTintColor: theme.primaryColor,
                    headerShown: true,
                    title: title || '',
                    headerBackVisible: false,
                    header: () => (
                        <Header 
                            title={title}
                            subtitle={subtitle}
                        />
                    ),
                };
            }}
        >
            <Stack.Screen 
                name="index"
            />
        </Stack>
    );
}

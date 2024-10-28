import { Stack } from "expo-router";

import { Header } from "@/components/header";
import { useScript } from "@/hooks/script/use-script";
import { ScreenContextProvider } from "@/contexts/screen";

export default function ScreenLayout() {
    const { script } = useScript();

    return (
        <ScreenContextProvider>
            {({ screen, goBack }) => {
                return (
                    <>
                        <Header
                            backButtonVisible
                            subtitle={script!.title}
                            title={screen.title}
                            onBackButtonPress={goBack}
                        />
            
                        <Stack
                            screenOptions={{
                                headerShown: false,
                            }}
                        >
                            <Stack.Screen 
                                name="index"
                            />
                        </Stack>
                    </>
                );
            }}
        </ScreenContextProvider>
    );
}
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SplashScreenController } from '@/components/splash';
import { AppContextProvider, useAppContext } from '@/contexts/app';
import "@/global.css";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    anchor: '(main)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AppContextProvider>
			<SafeAreaProvider>
				<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
					<SplashScreenController />
					<RootNavigator />
					<StatusBar style="auto" />
				</ThemeProvider>
			</SafeAreaProvider>
        </AppContextProvider>
    );
}

function RootNavigator() {
    const { authenticatedUser } = useAppContext();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Protected guard={!!authenticatedUser}>
                <Stack.Screen name="(main)" />
            </Stack.Protected>
            <Stack.Protected guard={!authenticatedUser}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>
        </Stack>
    );
}

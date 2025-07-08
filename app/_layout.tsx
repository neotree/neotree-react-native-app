import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SessionProvider, useSession } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import './global.css';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    // fonts
    const [fontsLoaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    const isReady = fontsLoaded;

    if (!isReady) return null;

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SessionProvider>
                <RootNavigator />
                <StatusBar style="auto" />
            </SessionProvider>
        </ThemeProvider>
    );
}

function RootNavigator() {
    // session
    const { isLoading: isSessionLoading, session, } = useSession();

    const isLoading = isSessionLoading;

    useEffect(() => {
        if (!isLoading) SplashScreen.hideAsync();
    }, [isLoading]);

    if (isLoading) return null;

    return (
        <>
            <Stack>
                <Stack.Protected guard={!!session}>
                    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                </Stack.Protected>

                <Stack.Protected guard={!session}>
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                </Stack.Protected>
                
                <Stack.Screen name="+not-found" />
            </Stack>
        </>
    );
}

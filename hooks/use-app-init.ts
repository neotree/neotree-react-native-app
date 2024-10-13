import { useEffect, useState, useMemo } from "react";
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';

import { initDB } from '@/data';

export function useAppInit() {
    const [dataInitialised, setDataInitialised] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const [fontsLoaded, loadFontsError] = useFonts({
        "Roboto-Black": require("../assets/fonts/Roboto-Black.ttf"),
        "Roboto-BlackItalic": require("../assets/fonts/Roboto-BlackItalic.ttf"),
        "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
        "Roboto-BoldItalic": require("../assets/fonts/Roboto-BoldItalic.ttf"),
        "Roboto-Light": require("../assets/fonts/Roboto-Light.ttf"),
        "Roboto-LightItalic": require("../assets/fonts/Roboto-LightItalic.ttf"),
        "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
        "Roboto-MediumItalic": require("../assets/fonts/Roboto-MediumItalic.ttf"),
        "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
        "Roboto-Italic": require("../assets/fonts/Roboto-Italic.ttf"),
        "Roboto-Thin": require("../assets/fonts/Roboto-Thin.ttf"),
        "Roboto-ThinItalic": require("../assets/fonts/Roboto-ThinItalic.ttf"),
    });

    const isReady = useMemo(() => !!(dataInitialised && fontsLoaded), [
        dataInitialised, 
        fontsLoaded,
    ]);

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    useEffect(() => {
        (async () => {
            try {
                await initDB();
            } catch(e: any) {
                setErrors([e.message]);
            } finally {
                setDataInitialised(true);
            }
        })();
    }, []);

    const appErrors = useMemo(() => [
        ...(!loadFontsError ? [] : [loadFontsError.message]),
        ...errors,
    ], [errors, loadFontsError]);

    return {
        isReady,
        errors: appErrors,
    };
}

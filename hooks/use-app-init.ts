import { useEffect, useState } from "react";
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';

import { db as initDB } from "@/lib/db";

export function useAppInit() {
    const [isReady, setIsReady] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [db, setDb] = useState<Awaited<ReturnType<typeof initDB>>>(null!);

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

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    useEffect(() => {
        (async () => {
            try {
                const db = await initDB();
                setDb(db);
            } catch(e: any) {
                setErrors([e.message]);
            } finally {
                setIsReady(true);
            }
        })();
    }, []);

    return {
        isReady,
        errors,
        ...db,
    };
}

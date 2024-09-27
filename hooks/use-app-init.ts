import { useEffect, useState } from "react";
import { SplashScreen } from 'expo-router';

import { db as initDB } from "@/lib/db";

export function useAppInit() {
    const [isReady, setIsReady] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [db, setDb] = useState<Awaited<ReturnType<typeof initDB>>>(null!);

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

import React, { ReactElement, useCallback, useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { InitialState, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const NAVIGATION_STATE_KEY = `NAVIGATION_STATE_KEY-${Constants?.manifest?.sdkVersion}`;

export type FontSource = Parameters<typeof Font.loadAsync>[0];

const usePromiseAll = (
    promises: Promise<void | void[] | Asset[]>[],
    cb: () => void
) => useEffect(() => {
    (async () => {
        await Promise.all(promises);
        cb();
    })();
});

const useLoadAssets = (assets: number[], fonts: FontSource): boolean => {
    const [ready, setReady] = useState(false);
    usePromiseAll(
        [Font.loadAsync(fonts), ...assets.map((asset) => Asset.loadAsync(asset))],
        () => setReady(true)
    );
    return ready;
};

export interface LoadAssetsProps {
    fonts?: FontSource;
    assets?: number[];
    children: ReactElement | ReactElement[];
    initialiseData?: () => Promise<any>;
}

export const LoadAssets = ({ assets, fonts, children, initialiseData }: LoadAssetsProps) => {
    const [isNavigationReady, setIsNavigationReady] = useState(true); // useState(!__DEV__);
    const [initialState, setInitialState] = useState<InitialState | undefined>();
    const [dataInitialised, setDataInitialised] = useState(false);
    const ready = useLoadAssets(assets || [], fonts || {});

    useEffect(() => {
        (async () => {
            try { if (initialiseData) await initialiseData(); } catch(e) { /**/ }
            setDataInitialised(true);
        })();
    }, []);

    useEffect(() => {
        const restoreState = async () => {
            try {
               
            } finally {
                setIsNavigationReady(true);
            }
        };

        if (!isNavigationReady) {
            restoreState();
        }
    }, [isNavigationReady]);

    useEffect(() => {
        (async () => {
            if (ready && isNavigationReady) await SplashScreen.hideAsync();
        })();
    }, [ready, isNavigationReady]);

    const onStateChange = useCallback((state: any) => {
        // AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
    }, []);

    if (!ready || !isNavigationReady || !dataInitialised) return null;

    return (
        <NavigationContainer {...{ onStateChange, initialState }}>
            <StatusBar style="light" />
            {children}
        </NavigationContainer>
    );
};

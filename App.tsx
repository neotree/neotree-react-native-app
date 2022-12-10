import 'react-native-gesture-handler';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { 
    assets as srcAssets,
	DrawerNavigation,
	ThemeProvider, 
	LoadAssets, 
	LoadAssetsProps,
    AppContextProvider 
} from './src';

const assets: LoadAssetsProps['assets'] = [
    ...srcAssets,
];

const fonts: LoadAssetsProps['fonts'] = {};

export default function App() {
    return (
        <AppContextProvider>
            <ThemeProvider>
                <LoadAssets {...{ fonts, assets }}>
                    <SafeAreaProvider>
                        <DrawerNavigation />
                    </SafeAreaProvider>
                </LoadAssets>
            </ThemeProvider>
        </AppContextProvider>
    );
}

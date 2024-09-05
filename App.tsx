import 'react-native-gesture-handler';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from 'react-native-error-boundary'
import Icon from '@expo/vector-icons/MaterialIcons';

import {CustomError}from './src/types'
import {handleAppCrush} from './src/utils/handleCrashes'

import { 
    assets as srcAssets,
	Navigation,
	ThemeProvider, 
	LoadAssets, 
	LoadAssetsProps,
    AppContextProvider 
} from './src';

const assets: LoadAssetsProps['assets'] = [
    ...srcAssets,
];

const fonts: LoadAssetsProps['fonts'] = {
    ...Icon.font,
};

export default function App() {

    const errorHandler = (error: Error, stackTrace: string) => {
        const customError = ({message: error.message,stack: stackTrace} as CustomError)   
        handleAppCrush(customError)
      }
      
    return (
        <ErrorBoundary onError={errorHandler}>
        <AppContextProvider>
            <ThemeProvider>
                <LoadAssets {...{ fonts, assets }}>
                    <SafeAreaProvider>
                   
                        <Navigation />
            
                    </SafeAreaProvider>
                </LoadAssets>
            </ThemeProvider>
        </AppContextProvider>
        </ErrorBoundary>
    );
}

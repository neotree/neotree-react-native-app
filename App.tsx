import 'react-native-gesture-handler';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {CustomError}from './src/types'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import ErrorBoundary from 'react-native-error-boundary'
import {handleAppCrush} from './src/utils/handleCrashes'

const firebaseConfig = Constants.manifest?.extra?.firebase;
firebase.initializeApp(firebaseConfig);

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

const fonts: LoadAssetsProps['fonts'] = {};

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

import 'react-native-gesture-handler';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from 'react-native-error-boundary'
import Icon from '@expo/vector-icons/MaterialIcons';

import {logFatal} from './src/utils/logError'
import {installGlobalErrorHandlers} from './src/utils/installGlobalErrorHandlers'
import {addBreadcrumb} from './src/utils/breadcrumbs'

import { 
    assets as srcAssets,
	Navigation,
	ThemeProvider, 
	LoadAssets, 
	LoadAssetsProps,
    AppContextProvider 
} from './src';

installGlobalErrorHandlers();

const assets: LoadAssetsProps['assets'] = [
    ...srcAssets,
];

const fonts: LoadAssetsProps['fonts'] = {
    ...Icon.font,
};

export default function App() {
    const errorHandler = (error: Error, stackTrace: string) => {
        // Routed through logFatal rather than straight to handleAppCrush so a
        // render crash is printed in development like every other report.
        // react-native-error-boundary swallows the red box, so without this the
        // most important class of error is the one you cannot see.
        logFatal('app.errorBoundary', { message: error.message, stack: stackTrace })
    };

    React.useEffect(() => { addBreadcrumb('app', 'app mounted'); }, []);
      
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

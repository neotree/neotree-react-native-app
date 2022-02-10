import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './navigation';
import { createTheme, ThemeProvider } from './components/ui';

const theme = createTheme({
    palette: {
        primary: {
            main: '#70a487',
            dark: '#70a487',
            light: '#70a487',
            contrastText: '#ffffff',
        },
    
        secondary: {
            main: '#2b304a',
            dark: '#2b304a',
            light: '#2b304a',
            contrastText: '#ffffff',
        },
    }
});

export default function() {
    return (
        <SafeAreaProvider>
            <ThemeProvider theme={theme}>
                <Navigation colorScheme="light" />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

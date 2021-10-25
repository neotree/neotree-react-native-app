import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, createTheme  } from '@/components/ui';
import useCachedResources from '@/hooks/useCachedResources';
import useColorScheme from '@/hooks/useColorScheme';
import { Navigation, LoginScreen } from '@/screens';
import { AppContext } from '@/AppContext';
import { useApi } from '@/hooks/useApi';

const theme = createTheme({});
const darkTheme = createTheme({
    palette: { mode: 'dark' },
});

export default function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();
    const [
      { 
        authenticatedUser,
        initialised: apiInitialised,
        initialising: initialisingApi, 
      }, 
      initApi
    ] = useApi();

    if (!isLoadingComplete) return null;

    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <AppContext.Provider
                value={{
                  authenticatedUser,
                  colorScheme,
                  refreshApp: initApi,
                }}
            >
                <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : theme}>
                    {(() => {
                        if (!authenticatedUser) return <LoginScreen />;
                        
                        return <Navigation colorScheme={colorScheme} />;
                    })()}
                </ThemeProvider>
                <StatusBar />
            </AppContext.Provider>
        </SafeAreaProvider>
    );
}

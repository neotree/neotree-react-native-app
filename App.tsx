import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, createTheme  } from '@/components/ui';
import { ErrorBox  } from '@/components/ErrorBox';
import useCachedResources from '@/hooks/useCachedResources';
import useColorScheme from '@/hooks/useColorScheme';
import { Navigation, LoginScreen, InitialLocationSetupScreen } from '@/screens';
import { AppContext } from '@/AppContext';
import { useApi } from '@/hooks/useApi';
import { Splash } from './components/Splash';

const theme = createTheme({});
const darkTheme = createTheme({
    palette: { mode: 'dark' },
});

export default function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();
    const [
      { 
        error: initError,
        location,
        authenticatedUser,
        initialised: apiInitialised,
        initialising: initialisingApi, 
      }, 
      initApi
    ] = useApi();

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
                        if (initialisingApi || !isLoadingComplete) return <Splash loader />;
                        if (initError) return <ErrorBox error={initError.message} />
                        if (!authenticatedUser) return <LoginScreen />;
                        if (!location) return <InitialLocationSetupScreen />;
                        return <Navigation colorScheme={colorScheme} />;
                    })()}
                </ThemeProvider>
                <StatusBar />
            </AppContext.Provider>
        </SafeAreaProvider>
    );
}

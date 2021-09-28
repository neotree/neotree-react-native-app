import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import useCachedResources from '@/hooks/useCachedResources';
import useColorScheme from '@/hooks/useColorScheme';
import { useApi } from '@/hooks/useApi';
import { AppContext } from '@/AppContext';
import HomeScreen from '@/screens/HomeScreen';
import ConfigScreen from '@/screens/ConfigScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import LoginScreen from '@/screens/LoginScreen';
import * as copy from '@/constants/copy/common';

const Drawer = createDrawerNavigator();

export default function App() {
  const resourcesLoaded = useCachedResources();
  const colorScheme = useColorScheme();
  const [
    { 
      authenticatedUser,
      initialised: apiInitialised,
      initialising: initialisingApi, 
    }, 
    initApi
  ] = useApi();

  return (
    <SafeAreaProvider>
      <StatusBar />
      <AppContext.Provider
        value={{
          authenticatedUser,
          colorScheme,
          refreshApp: initApi,
        }}
      >
        <NavigationContainer>
          {(() => {
            if (!(apiInitialised && resourcesLoaded) || initialisingApi) return null;

            if (!authenticatedUser) {
              return (
                <Drawer.Navigator initialRouteName="Login">
                  <Drawer.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{
                      headerShown: false,
                      swipeEnabled: false,
                      drawerLabel: () => null,
                      title: null,
                      drawerIcon: () => null
                    }}
                  />
                </Drawer.Navigator>
              )
            }

            return (
              <Drawer.Navigator 
                initialRouteName="Home"
              >
                <Drawer.Screen 
                  name="Home" 
                  component={HomeScreen} 
                  options={{
                    title: copy.HOME,
                  }}
                />
                <Drawer.Screen name="Config" 
                  component={ConfigScreen} 
                  options={{
                    title: copy.CONFIGURATION,
                  }}
                />
                <Drawer.Screen 
                  name="History" 
                  component={HistoryScreen} 
                  options={{
                    title: copy.HISTORY,
                  }}
                />
              </Drawer.Navigator>
            );
          })()}
        </NavigationContainer>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}

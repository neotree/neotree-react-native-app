import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ColorSchemeName, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { ConfigScreen } from '@/screens/Config';
import { HomeScreen } from '@/screens/Home';
import { HistoryScreen } from '@/screens/History';
import { ScriptScreen } from '@/screens/Script';
import { LoginScreen } from '@/screens/Login';
import { LocationScreen } from '@/screens/Location';
import { NotFoundScreen } from '@/screens/NotFound';
import { RootStackParamList, RootDrawerParamList } from '@/types';
import * as copy from '@/constants/copy/common';
import { Logo } from '@/components/Logo';
import { ArrowBack } from '@/components/ArrowBack';
import { TabBarIcon } from '@/components/TabBarIcon';
import { useTheme, Text  } from '@/components/ui';

export {
    ConfigScreen,
    HomeScreen,
    HistoryScreen,
    ScriptScreen,
    LoginScreen,
    NotFoundScreen,
    LocationScreen,
};

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.makeUrl('/')],
    config: {
        screens: {
            Root: {
                screens: {
                    Home: {
                        screens: {
                            HomeScreen: 'home',
                        }
                    },
                    History: {
                        screens: {
                            HistoryScreen: 'History',
                        }
                    },
                }
            },
            NotFound: '*',
        }
    }
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

function DrawerNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerTitleAlign: 'center',
            }}
        >
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    headerTitle: () => <Logo size="small" />,
                    drawerIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                })}
            />
            <Drawer.Screen
                name="History"
                component={HistoryScreen}
                options={({ navigation }) => ({
                    title: copy.HISTORY,
                    drawerIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
                })}
            />
            <Drawer.Screen
                name="Config"
                component={ConfigScreen}
                options={({ navigation }) => ({
                    title: copy.CONFIGURATION,
                    drawerIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
                })}
            />
        </Drawer.Navigator>
    );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
    const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    const theme = useTheme();
    return (
        <NavigationContainer
            linking={linking}
            theme={{
                ...navTheme,
                colors: {
                    ...navTheme.colors,
                    primary: theme.palette.primary.main,
                    text: theme.palette.text.primary,
                    background: theme.palette.background.paper,
                    card: theme.palette.background.paper,
                    border: theme.palette.divider,
                    notification: theme.palette.info.main,
                },
            }}
        >
            <Stack.Navigator
                screenOptions={({ navigation }) => ({
                    headerTitleAlign: 'center',
                })}
            >
                <Stack.Screen 
                    name="Root" 
                    component={DrawerNavigator} 
                    options={{ 
                        headerShown: false 
                    }} 
                />

                <Stack.Group 
                    screenOptions={{ 
                        presentation: 'fullScreenModal',
                    }}
                >
                    <Stack.Screen 
                        name="Script" 
                        component={ScriptScreen} 
                        options={({ navigation }) => ({
                            headerLeft: () => {
                                if (Platform.OS === 'ios') return <ArrowBack navigation={navigation} />;
                                return null;
                            },
                        })}
                    />
                </Stack.Group>

                <Stack.Screen 
                    name="NotFound" 
                    component={NotFoundScreen} 
                    options={{ 
                        title: 'Oops!',
                    }} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

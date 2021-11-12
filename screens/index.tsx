import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ColorSchemeName, SafeAreaView, StatusBar } from 'react-native';
import * as Linking from 'expo-linking';
import { ConfigScreen } from '@/screens/Config';
import { HomeScreen } from '@/screens/Home';
import { HistoryScreen } from '@/screens/History';
import { ScriptScreen } from '@/screens/Script';
import { LoginScreen } from '@/screens/Login';
import { LocationScreen, InitialLocationSetupScreen } from '@/screens/Location';
import { NotFoundScreen } from '@/screens/NotFound';
import { RootStackParamList, RootDrawerParamList } from '@/types';
import * as copy from '@/constants/copy/common';
import { Logo } from '@/components/Logo';
import { TabBarIcon } from '@/components/TabBarIcon';
import { useTheme, Text, Divider, View, Button, Content  } from '@/components/ui';

export {
    ConfigScreen,
    HomeScreen,
    HistoryScreen,
    ScriptScreen,
    LoginScreen,
    NotFoundScreen,
    LocationScreen,
    InitialLocationSetupScreen,
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
                    Location: {
                        screens: {
                            LocationScreen: 'Location',
                        }
                    },
                    Config: {
                        screens: {
                            ConfigScreen: 'Config',
                        }
                    },
                }
            },
            NotFound: '*',
        }
    }
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

const DrawerContent = (props) => {
    const theme = useTheme();
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View
                style={{ 
                    height: 200, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: theme.palette.primary.main, 
                }}
            >
                <Logo />
            </View>
    
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <Divider />

            <Content 
                pv={theme.spacing()} 
                ph={theme.spacing()}
            >
                <Button 
                    color="primary" 
                    variant="contained"
                >
                    <Text>{copy.LOGOUT}</Text>
                </Button>
            </Content>
        </SafeAreaView>
    );
}

function DrawerNavigator() {
    const theme = useTheme();
    return (
        <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerTitleAlign: 'left',
                headerTintColor: theme.palette.primary.main,
            }}
            drawerContent={props => <DrawerContent {...props} />}
        >
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    headerTitle: copy.HOME,
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
            <Drawer.Screen
                name="Location"
                component={LocationScreen}
                options={({ navigation }) => ({
                    title: copy.LOCATION,
                    drawerIcon: ({ color }) => <TabBarIcon name="location-pin" color={color} />,
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
        <>
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
                        headerTitleAlign: 'left',
                    })}
                >
                    <Stack.Screen 
                        name="Root" 
                        component={DrawerNavigator} 
                        options={{ 
                            headerShown: false,
                        }} 
                    />

                    <Stack.Group 
                        screenOptions={{ 
                            presentation: 'card',
                            headerTitleAlign: 'left',
                        }}
                    >
                        <Stack.Screen 
                            name="Script" 
                            component={ScriptScreen} 
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

            <StatusBar 
                backgroundColor={theme.palette.primary.main} 
                barStyle="light-content"
            />
        </>
    );
}

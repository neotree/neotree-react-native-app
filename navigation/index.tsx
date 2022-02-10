import React from 'react';
import * as Linking from 'expo-linking';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ColorSchemeName, SafeAreaView } from 'react-native';
import { Configuration } from './Configuration';
import { Scripts } from './Scripts';
import { Script } from './Script';
import { Settings } from './Settings';
import { History } from './History';
import { NotFound } from './NotFound';
import { RootStackParamList, RootDrawerParamList } from '@/types';
import * as types from '@/types';
import * as copy from '@/constants/copy';
import { Text, View, Button, Divider, useTheme } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { MaterialIcons } from '@expo/vector-icons';

export const TabBarIcon = (props: { name: React.ComponentProps<typeof MaterialIcons>['name']; color: string; }) => (
    <MaterialIcons size={30} style={{ marginBottom: -3 }} {...props} />
);

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Root: {
                screens: {
                    Scripts: {
                        screens: {
                            Scripts: 'home',
                        }
                    },
                    History: {
                        screens: {
                            HistoryScreen: 'History',
                        }
                    },
                    Settings: {
                        screens: {
                            Settings: 'Location',
                        }
                    },
                    Configuration: {
                        screens: {
                            Configuration: 'Config',
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
                style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}
            >
                <Logo />
            </View>
    
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <Divider />

            <View 
                pv={theme.spacing()} 
                ph={theme.spacing()}
            >
                <Button 
                    color="primary" 
                    variant="contained"
                >
                    <Text>{copy.LOGOUT}</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}

function DrawerNavigator() {
    const theme = useTheme();
    return (
        <Drawer.Navigator
            initialRouteName="Scripts"
            screenOptions={{
                headerTitleAlign: 'left',
                headerTintColor: theme.palette.primary.main,
            }}
            drawerContent={props => <DrawerContent {...props} />}
        >
            <Drawer.Screen
                name="Scripts"
                component={Scripts}
                options={({ navigation }) => ({
                    headerTitle: copy.SCRIPTS,
                    drawerIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                })}
            />
            <Drawer.Screen
                name="History"
                component={History}
                options={({ navigation }) => ({
                    title: copy.HISTORY,
                    drawerIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
                })}
            />
            <Drawer.Screen
                name="Configuration"
                component={Configuration}
                options={({ navigation }) => ({
                    title: copy.CONFIGURATION,
                    drawerIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
                })}
            />
            <Drawer.Screen
                name="Settings"
                component={Settings}
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
                        component={Script} 
                    />
                </Stack.Group>

                <Stack.Screen 
                    name="NotFound" 
                    component={NotFound} 
                    options={{ 
                        title: 'Oops!',
                    }} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

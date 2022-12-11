import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as types from './types';
import registerdAssets from './assets';
import { AuthenticationNavigator } from './Authentication';
import { HomeNavigator } from './Home';

export const assets = Object.values(registerdAssets);
export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';

const RootStack = createNativeStackNavigator<types.AppRoutes>();

export function Navigation() {
    return (
        <>
            <StatusBar style="dark" />
            <RootStack.Navigator>
                <RootStack.Screen
                    name="Authentication"
                    component={AuthenticationNavigator}
                    options={{
                        headerShown: false,
                    }}
                />

                <RootStack.Screen
                    name="Home"
                    component={HomeNavigator}
                />
            </RootStack.Navigator>
        </>
    );
}

import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
    anchor: 'index',
};

export default function AuthRootLayout() {
    return (
        <Stack
            screenOptions={{ 
                headerShown: false, 
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="forgot-password" />
        </Stack>
    );
}
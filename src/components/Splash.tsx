import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image } from 'react-native';
import { Box, useTheme } from './Theme';
import assets from '../assets';

export function Splash() {
    const theme = useTheme();

    return (
        <>
            <StatusBar style="dark" translucent />
            
            <Box
                flex={1}
                justifyContent="center"
                alignItems="center"
            >
                <Image 
                    source={assets.logo}
                    style={{ width: 200, height: 200 }}
                />
            </Box>

            <Box
                padding="l"
                alignItems="center"
                justifyContent="center"
            >
                <ActivityIndicator 
                    size={36}
                    color={theme.colors.primary}
                />
            </Box>
        </>
    )
}

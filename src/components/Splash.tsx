import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { Box } from './Theme';
import assets from '../assets';

export function Splash() {
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
        </>
    )
}

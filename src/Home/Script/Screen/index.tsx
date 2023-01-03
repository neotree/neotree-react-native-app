import React from 'react';
import { Box, Content, Fab, Text } from '../../../components';
import { ScreenType } from './ScreenType';
import { useContext } from '../Context';

export function Screen() {
    const ctx = useContext();
    
    return (
        <Box flex={1}>
            <ScreenType />

            <Box 
                position="absolute"
                bottom={25}
                right={25}
            >
                <Fab onPress={() => alert('OUCH!!!')} />
            </Box>
        </Box>
    );
}

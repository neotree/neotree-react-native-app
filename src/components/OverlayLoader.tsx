import React from 'react';
import { ActivityIndicator, Modal } from 'react-native';
import { Box, useTheme } from './Theme';

export type OverlayLoaderProps = {
    light?: boolean;
};

export function OverlayLoader({ light }: OverlayLoaderProps) {
    const theme = useTheme();

    return (
        <Modal
            visible
            transparent
            statusBarTranslucent
            animationType="none"
            onRequestClose={() => {}}
        >
            <Box 
                flex={1}
                justifyContent="center"
                alignItems="center"
                style={{ 
                    backgroundColor: light ? 'rgba(255,255,255,.25)' : theme.colors['bg.active'],
                }}
            >
                <ActivityIndicator 
                    color={theme.colors.primary}
                    size={48}
                />
            </Box>
        </Modal>
    );
}

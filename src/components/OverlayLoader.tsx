import React from 'react';
import { ActivityIndicator, Modal } from 'react-native';
import { Box, Text, useTheme } from './Theme';

export type OverlayLoaderProps = {
    light?: boolean;
    transparent?: boolean;
    backgroundColor?: string;
    /** Shown under the spinner, for work long enough to need progress. */
    label?: string;
};

export function OverlayLoader({ light, transparent, backgroundColor: bgColor, label }: OverlayLoaderProps) {
    const theme = useTheme();

    let backgroundColor = bgColor || (light ? 'rgba(255,255,255,.25)' : theme.colors['bg.active']);

    return (
        <Modal
            visible
            transparent={transparent}
            statusBarTranslucent
            animationType="none"
            onRequestClose={() => {}}
        >
            <Box 
                flex={1}
                justifyContent="center"
                alignItems="center"
                style={[
                    transparent === false ? null : { backgroundColor },
                ]}
            >
                <ActivityIndicator 
                    color={theme.colors.primary}
                    size={48}
                />

                {!!label && (
                    <Box marginTop="m">
                        <Text style={{ textAlign: 'center' }}>{label}</Text>
                    </Box>
                )}
            </Box>
        </Modal>
    );
}

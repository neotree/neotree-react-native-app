import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, useTheme } from './Theme';

export type FabProps = {
    onPress: () => void;
};

export function Fab({ onPress }: FabProps) {
    const theme = useTheme();

    return (
        <TouchableOpacity onPress={onPress}>
            <Box
                backgroundColor="primary"
                elevation={24}
                shadowColor="grey-400"
                shadowOffset={{ width: -2, height: 4 }}
                shadowOpacity={0.2}
                shadowRadius={3}
                height={50}
                width={50}
                justifyContent="center"
                alignItems="center"
                style={{ borderRadius: 25 }}
            >
                <Icon 
                    name={Platform.OS === 'ios' ? 'arrow-forward-ios' : 'arrow-forward'}  
                    size={28} 
                    color={theme.colors.primaryContrastText}
                />
            </Box>
        </TouchableOpacity>
    );
}

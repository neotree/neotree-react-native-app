import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps as RNTouchableOpacityProps } from 'react-native';
import { useTheme } from '../theme';

export type TouchableOpacityProps = RNTouchableOpacityProps & {
    color?: 'primary' | 'secondary' | 'disabled';
    variant?: 'outlined' | 'contained';
};

export function Button({
    color, 
    variant,
    ...props
}: TouchableOpacityProps) {
    const theme = useTheme();
    
    return (
        <>
            <RNTouchableOpacity {...props} />
        </>
    );
}

import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Color } from '../types';

export type ButtonProps = TouchableOpacityProps & {
    children?: React.ReactNode | string;
    fullWidth?: boolean;
    variant?: 'outlined' | 'contained' | 'default';
    color?: Color;
    disableElevation?: boolean;
    roundedCorners?: boolean;
    endIcon?: React.ReactNode;
    startIcon?: React.ReactNode;
    align?: 'left' | 'center' | 'right';
};

export const ButtonContext = React.createContext<ButtonProps | null>(null);

export const useButtonContext = () => React.useContext(ButtonContext);

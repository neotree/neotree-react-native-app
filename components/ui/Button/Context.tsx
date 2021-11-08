import React from 'react';
import { TouchableOpacityProps, View } from 'react-native';
import { TextProps } from '../Text';

export type ButtonProps = TouchableOpacityProps & {
    endIcon?: React.ReactNode;
    startIcon?: React.ReactNode;
    variant?: 'default' | 'outlined' | 'contained';
    color?: 'default' | 'primary' | 'secondary';
    children?: React.ReactNode;
};

export const defaultButtonProps: ButtonProps = {
    variant: 'default',
    color: 'default',
};

export interface IButtonContext {
    props: ButtonProps;
    ref?: React.MutableRefObject<View>;
    textProps?: TextProps;
};

export const defaultButtonContext = {
    props: defaultButtonProps,
};

export const ButtonContext = React.createContext<IButtonContext>(null);

export const useButtonContext = () => React.useContext(ButtonContext);

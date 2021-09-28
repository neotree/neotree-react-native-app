import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useButtonContext } from '../Button/Context';
import { Color } from '../types';
import { StyleProp } from 'react-native';

type IconTypes =  keyof typeof MaterialIcons;

export type IconProps = {
    color?: Color;
    customColor?: string;
    style: StyleProp<any>;
};

export const Icon = React.forwardRef(({ color, customColor, style, ...props }: IconProps, ref) => {
    const iconRef = React.useRef(null);
    React.useImperativeHandle(ref, () => iconRef.current);
    const theme = useTheme();

    const btnContext = useButtonContext();
    color = color || 'primary';
    let _color = theme.palette.text[color];
    if (btnContext && btnContext?.color) {
        if (btnContext.variant === 'contained') {
            _color = theme.palette[btnContext?.color]?.contrastText || theme.palette.text[btnContext?.color];
        } else {
            _color = theme.palette[btnContext?.color]?.main || theme.palette.text[btnContext?.color];
        }
    }

    return (
        <MaterialIcons 
            ref={iconRef}
            color={customColor || _color}
            style={[
                /* @ts-ignore */
                style && style.map ? style : [style],
            ]}
            {...props}
        /> 
    );
});

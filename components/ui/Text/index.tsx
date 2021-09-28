import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../theme';
import { useButtonContext } from '../Button/Context';
import { Color } from '../types';

export type TextProps = RNTextProps & {
    children?: string;
    color?: Color;
    variant?: 'button' | 'caption' | 'h1' | 'h2' | 'h3';
    customColor?: string;
};

export const Text = React.forwardRef(({ children, color, style, variant, customColor, ...props }: TextProps, ref) => {
    const textRef = React.useRef(null);
    React.useImperativeHandle(ref, () => textRef.current);
    const theme = useTheme();

    const btnContext = useButtonContext();
    color = color || 'primary';
    let _color = theme.palette.text[color];
    if (color === 'error') _color = theme.palette.error.main;
    
    if (btnContext && btnContext?.color) {
        if (btnContext.variant === 'contained') {
            _color = theme.palette[btnContext?.color]?.contrastText || theme.palette.text[btnContext?.color];
        } else {
            _color = theme.palette[btnContext?.color]?.main || theme.palette.text[btnContext?.color];
        }
    }

    variant = variant || (btnContext ? 'button' : undefined);
    
    return (
        <RNText 
            ref={textRef}
            style={[
                { color: customColor || _color },
                theme?.typography[variant] ? theme?.typography[variant] : {},
                /* @ts-ignore */
                style && style.map ? style : [style],
            ]}
            {...props}
        > 
            {children}
        </RNText>
    );
});

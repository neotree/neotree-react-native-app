import React from 'react';
import { Text as RNText, TextProps as RNTextProps, } from 'react-native';
import { useTheme } from '../theme';
import { useButtonContext } from '../Button/Context';
import { getTextColor } from '../utils/colors';

export type TextProps = RNTextProps & {
    children?: string;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'button' | 'caption' | 'overline';
    color?: 'primary' | 'secondary' | 'info' | 'warning' | 'error' | 'success' | 'disabled' | 'textPrimary' | 'textSecondary';
};

export const Text = React.forwardRef(({
    variant,
    style,
    color,
    ...props
}: TextProps, ref) => {
    color = color || 'textPrimary';
    variant = variant || 'body1';

    const theme = useTheme();
    const textRef = React.useRef(null);
    React.useImperativeHandle(ref, () => textRef.current);

    const btnContext = useButtonContext();

    return (
        <>
            <RNText
                allowFontScaling
                {...props}
                {...btnContext?.textProps}
                ref={textRef}
                style={[
                    theme.typography[variant],
                    { color: getTextColor(theme, color) },
                    btnContext ? { textAlign: 'center' } : {},
                    btnContext?.textProps?.style,
                    style,
                ]}
            />
        </>
    );
});

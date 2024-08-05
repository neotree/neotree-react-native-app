import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, TextProps  } from 'react-native';
import { useTheme, Text } from './Theme';

export type ButtonProps = TouchableOpacityProps & {
    size?: 's' | 'm' | 'l';
    color?: 'primary' | 'secondary';
    variant?: 'default' | 'link'
    children?: React.ReactNode | string;
    textStyle?: TextProps['style'];
};

export function Button({ 
    variant = 'default', 
    children, 
    style,
    color = 'primary',
    size = 'm',
    textStyle,
    ...props 
}: ButtonProps) {
    const theme = useTheme();

    return (
        <TouchableOpacity
            {...props}
            style={[
                { borderRadius: theme.borderRadii.m, },
                (() => {
                    let backgroundColor = theme.colors[color];
                    if (props.disabled) backgroundColor = theme.colors.disabledBackground;

                    switch(variant) {
                        case 'link':
                            return {

                            };
                        default: 
                            return {
                                backgroundColor,                                
                                padding: theme.spacing[size],
                            };
                    }
                })(),       
                style,
            ]}
        >
            {typeof children !== 'string' ? children: (
                <Text
                    color={(() => {
                        if (props.disabled) return 'textDisabled';
                        return `${color}ContrastText`;
                    })()}
                    textAlign="center"
                    style={[
                        {
                            fontSize: (() => {                            
                                switch (size) {
                                    case 'l':
                                        return theme.textVariants.title2.fontSize;
                                    case 's':
                                        return theme.textVariants.caption.fontSize;
                                    default:
                                        return theme.textVariants.body.fontSize;
                                }
                            })(),
                        },
                        textStyle
                    ]}
                >{children}</Text>
            )}
        </TouchableOpacity>
    );
}

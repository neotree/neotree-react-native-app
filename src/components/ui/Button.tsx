import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Typography, TypographyProps } from "./Typography";
import { Theme, useTheme } from "./theme";

export type ButtonProps = TouchableOpacityProps & {
    variant: 'default' | 'link';
    size: keyof Theme['textSize'];
    rounded: keyof Theme['rounded'];
    color?: 'primary' | 'disabled';
    typographyProps?: Partial<TypographyProps>;
};

export function Button({ 
    children, 
    style, 
    variant, 
    size, 
    color, 
    typographyProps,
    rounded,
    ...props 
}: ButtonProps) {
    const theme = useTheme();

    return (
        <TouchableOpacity 
            {...props}            
            style={[
                styles.root,
                styles[variant],
                {
                    borderRadius: theme.rounded[rounded],
                },
                (() => {
                    switch(color) {
                        case 'primary':
                            return {
                                backgroundColor: theme.palette.primary.main,
                            };
                        case 'disabled':
                            return {
                                backgroundColor: theme.palette.disabled,
                            };
                        default:
                            return null;
                    }
                })(),
                (() => {
                    switch(variant) {
                        case 'default':
                            return {
                                padding: theme.spacing.md,
                            };
                        case 'link':
                            return null;
                        default:
                            return null;
                    }
                })(),
                style,
            ]}
        >
            {typeof children !== 'string' ? children : (
                <Typography
                    {...typographyProps}
                    size={size}
                    color={(() => {
                        switch(color) {
                            case 'disabled':
                                return 'text.disabled';
                            default:
                                return 'primary.contrast';
                        }
                    })()}
                    style={[
                        styles.typography,
                        typographyProps?.style,
                        (() => {
                            switch(color) {
                                case 'primary':
                                    return {
                                        color: theme.palette.primary.contrastText,
                                    };
                                case 'disabled':
                                    return {
                                        color: theme.palette.text.disabled,
                                    };
                                default:
                                    return null;
                            }
                        })(),
                    ]}
                >
                    {children}
                </Typography>
            )}
        </TouchableOpacity>
    );
}

Button.defaultProps = {
    size: 'sm',
    variant: 'default',
    color: 'primary',
    rounded: 'none',
};

const styles = StyleSheet.create({
    root: {
        
    },
    default: {
        
    },
    default_size: {

    },
    link: {

    },
    typography: {
        textAlign: 'center',
    }
});

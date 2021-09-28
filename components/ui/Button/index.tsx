import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme';
import { ButtonContext, ButtonProps, } from './Context';
import { Text } from '../Text';
import { shadow } from '../constants';

export type { ButtonProps };

export const Button = React.forwardRef((props: ButtonProps, ref) => {
    const buttonRef = React.useRef(null);
    React.useImperativeHandle(ref, () => buttonRef.current);

    const theme = useTheme();

    const { 
        children,
        fullWidth,
        color,
        variant,
        style,
        disabled,
        disableElevation,
        roundedCorners,
        endIcon,
        startIcon,
        align,
        ...restProps 
    } = props;

    const _color = disabled || color === 'disabled' ? theme.palette.action.disabledBackground : theme.palette[color]?.main;
    const backgroundColor = variant === 'contained' ? _color : null;
    const borderColor = ['outlined'].includes(variant) ? _color : null;

    return (
        <ButtonContext.Provider 
            value={{
                ...props,
                color: disabled ? 'disabled' : color,
            }}
        >
            <View
                style={[
                    fullWidth ? {
                        flexDirection: 'column',
                        justifyContent: 'center',
                    } : {
                        flexDirection: 'row',
                        alignItems: 'center',
                    }
                ]}
            >
                <TouchableOpacity
                    ref={buttonRef}
                    disabled={disabled}
                    style={[
                        {
                            borderWidth: 1,
                            borderColor: borderColor || 'transparent',
                            backgroundColor: backgroundColor || 'transparent',
                            padding: theme.spacing(),
                            paddingHorizontal: theme.spacing(2),
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: roundedCorners ? 5 : 0,
                        },
                        (!(disableElevation || disabled) && (variant === 'contained') && (color !== 'disabled')) ? shadow : {},
                        /* @ts-ignore */
                        style && style.map ? style : [style],
                    ]}
                    {...restProps}
                >
                    {!!startIcon && (
                        <View
                            style={{ marginRight: theme.spacing() }}
                        >{startIcon}</View>
                    )}

                    <View 
                        style={[
                            fullWidth ? { flex: 1 } : {},
                            { 
                                alignItems: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start'  )
                            },
                        ]}
                    >
                        {typeof children === 'string' ? <Text>{children}</Text> : children}
                    </View>

                    {!!endIcon && (
                        <View
                            style={{ marginLeft: theme.spacing() }}
                        >{endIcon}</View>
                    )}
                </TouchableOpacity>
            </View>
        </ButtonContext.Provider>
    );
});

Button.defaultProps = {
    fullWidth: true,
    roundedCorners: true,
    disableElevation: false,
    align: 'left',
};

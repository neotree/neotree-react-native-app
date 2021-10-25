import React from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import {  useTheme} from '../theme';
import { ButtonContext, ButtonProps, defaultButtonContext, defaultButtonProps } from './Context';
import { getTextColor, getColor } from '../utils/colors';

export const Button = React.forwardRef((props: ButtonProps, ref) => {
    props = { ...defaultButtonProps, ...props };
    const {
        startIcon,
        endIcon,
        style,
        variant,
        color,
        children,
        ..._props
    } = props;

    const theme = useTheme();
    const btnRef = React.useRef<View>();
    React.useImperativeHandle(ref, () => btnRef.current);

    const _color = getColor(theme, color);
    const textColor = (() => {
        let textColor = theme.palette.text.primary;
        if (color) textColor = _color || textColor;
        if (variant === 'outlined') textColor = _color || textColor;
        if (variant === 'contained') textColor = getTextColor(theme, `${color}ContrastText`) || textColor;
        if (props.disabled) textColor = theme.palette.text.disabled;
        return textColor;
    })();

    const renderIcon = React.useCallback((icon, type: 'start' | 'end') => !icon ? null : (
        <View 
            style={[
                type === 'end' ? { paddingLeft: theme.spacing() } : {},
                type === 'start' ? { paddingRight: theme.spacing() } : {},
            ]}
        >
            {icon}
        </View>
    ), [endIcon, startIcon]);

    return (
        <ButtonContext.Provider
            value={{
                ...defaultButtonContext,
                props,
                ref: btnRef,
                textProps: {
                    style: [
                        theme.typography.button,
                        { 
                            color: textColor, 
                        }
                    ],
                },
            }}
        >
            <Pressable
                {..._props}
                ref={btnRef}
                style={[
                    { 
                        padding: theme.spacing(), 
                        borderRadius: theme.borderRadius, 
                        borderColor: 'transparent',
                        borderWidth: 1, 
                    },
                    variant !== 'outlined' ? {} : {
                        borderColor: props.disabled ? theme.palette.action.disabled : _color || theme.palette.divider,
                    },
                    variant !== 'contained' ? {} : {
                        backgroundColor: props.disabled ? theme.palette.action.disabled : _color || theme.palette.divider,
                        borderColor: props.disabled ? theme.palette.action.disabled : _color || theme.palette.divider,
                    },
                    // @ts-ignore
                    style,
                ]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {renderIcon(startIcon, 'start')}
                    <View 
                        // style={{ flex: 1 }}
                    >
                        {children}
                    </View>
                    {renderIcon(endIcon, 'end')}
                </View>
            </Pressable>
        </ButtonContext.Provider>
    );
});

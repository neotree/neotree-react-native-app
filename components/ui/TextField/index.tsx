import React from 'react';
import { View, ViewProps, TextInput, TextInputProps, } from 'react-native';
import { useTheme } from '../theme';
import { Text, TextProps } from '../Text';
import { Color } from '../types';

export type TextFieldProps = TextInputProps & {
    label?: string;
    variant?: 'default' | 'outlined';
    containerProps?: ViewProps;
    labelProps?: TextProps;
    color?: Color;
    helperText?: string;
    error?: boolean;
    required?: boolean;
};

export const TextField = React.forwardRef(({ 
    style, 
    label, 
    containerProps,
    labelProps,
    onFocus,
    onBlur,
    onChangeText,
    value: valueProps,
    editable,
    color,
    variant,
    helperText,
    error,
    required,
    ...props 
}: TextFieldProps, ref) => {
    color = error ? 'error' : color || 'primary';

    const textFieldRef = React.useRef(null);
    React.useImperativeHandle(ref, () => textFieldRef.current);
    const theme = useTheme();

    const [focused, setFocused] = React.useState(false);
    const [value, setValue] = React.useState(valueProps || '');

    React.useEffect(() => {
        setValue(valueProps);
    }, [valueProps]);

    const { style: containerStyle, ..._containerProps } = { ...containerProps };
    const { style: labelStyle, ..._labelProps } = { ...labelProps };

    const _color = (editable === false) || (color === 'disabled') ? theme.palette.action.disabledBackground : theme.palette[color]?.main;

    return (
        <>
            <View 
                {..._containerProps}
                style={[
                    {
                        borderColor: error || focused || (editable === false) ? _color : theme.palette.divider,
                        backgroundColor: editable === false ? _color : undefined,
                    },
                    variant === 'outlined' ? {
                        borderWidth: 1,
                        borderRadius: 5,
                    } : {
                        borderBottomWidth: 1,
                    },
                    /* @ts-ignore */
                    containerStyle && containerStyle.map ? containerStyle : [containerStyle],
                ]}
            >
                {!!label && (
                    <Text
                        {..._labelProps}
                        color="disabled"
                        customColor={(focused) ? _color : undefined}
                        variant={(focused || value) ? 'caption' : undefined}
                        style={[
                            {
                                position: 'absolute',
                                bottom: (focused || value) ? '100%' : 0,
                                paddingVertical: theme.spacing(),
                                paddingHorizontal: (variant === 'outlined') && !(focused || value) ? theme.spacing() : 0,
                            },
                            /* @ts-ignore */
                            labelStyle && labelStyle.map ? labelStyle : [labelStyle],
                        ]}
                    >{`${label}${required ? ' *' : ''}`}</Text>
                )}

                <TextInput 
                    {...props}
                    ref={textFieldRef}
                    editable={editable}
                    value={value}
                    style={[
                        { padding: theme.spacing(), },
                        /* @ts-ignore */
                        style && style.map ? style : [style],
                    ]}
                    onChangeText={(...args) => {
                        setValue(args[0]);
                        if (onChangeText) onChangeText(...args);
                    }}
                    onFocus={(...args) => {
                        setFocused(true);
                        if (onFocus) onFocus(...args);
                    }}
                    onBlur={(...args) => {
                        setFocused(false);
                        if (onBlur) onBlur(...args);
                    }}
                />
            </View> 
            {!!helperText && (
                <Text
                    color={error ? 'error' : 'secondary'}
                    variant="caption"
                >{helperText}</Text>
            )}
        </>
    );
});

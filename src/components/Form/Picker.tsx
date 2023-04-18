import React from 'react';
import { Picker as RNPicker, PickerProps as RNPickerProps, PickerItemProps as RNPickerItemProps } from '@react-native-picker/picker';
import { Box, useTheme, Text } from '../Theme';
import { Br } from '../Br';

export type PickerOption = RNPickerItemProps & {
    label: string;
    value: string | number;
};

export type PickerProps = RNPickerProps & {
    size?: 's' | 'm' | 'l';
    errors?: string[];
    label?: React.ReactNode;
    options: PickerOption[];
};

export const Picker = (
    { 
        size,
        style,
        errors,
        label,
        options,
        ...props
    }: PickerProps,
) => {
    size = size || 'm';

    const theme = useTheme();

    return (
        <>
            {!!label && (
                <>
                    {typeof label !== 'string' ? label : (
                        <Text
                            variant="caption"
                            color="textSecondary"
                        >{label}</Text>
                    )}
                    <Br spacing="s" />
                </>
            )}
            <Box
                borderWidth={1}
                borderColor={errors?.length ? 'error' : 'divider'}
                borderRadius="m"
                backgroundColor={(props.enabled === false) ? 'disabledBackground' : undefined}
            >
                <RNPicker 
                    {...props}
                    style={[
                        {
                            padding: theme.spacing[size],
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
                        style,
                    ]}
                >
                    {options.map((o, i) => {
                        return (
                            <RNPicker.Item
                                key={`${i}${o.value}`}
                                label={o.label}
                                value={o.value}
                            />
                        );
                    })}
                </RNPicker>
            </Box>

            {(errors || []).map((e, i) => (
                <Text
                    variant="caption"
                    color="error"
                    key={`${e}${i}`}
                >{e}</Text>
            ))}        
        </>
    );
};

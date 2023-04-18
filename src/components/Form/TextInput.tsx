import React from 'react';
import { 
    TextInput as RNTextInput, 
    TextInputProps as RNTextInputProps 
} from 'react-native';
import { Box, useTheme, Text } from '../Theme';
import { Br } from '../Br';

export type TextInputProps = RNTextInputProps & {
    size?: 's' | 'm' | 'l';
    errors?: string[];
    label?: React.ReactNode;
};

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>((
    { 
        size,
        style,
        errors,
        label,
        ...props
    }: TextInputProps,
    ref
) => {
    size = size || 'm';

    const theme = useTheme();

    return (
        <>
            {!!label && (
                <>
                    {typeof label !== 'string' ? label : (
                        <Text>{label}</Text>
                    )}
                    <Br spacing="s" />
                </>
            )}
            <Box
                borderWidth={1}
                borderColor={errors?.length ? 'error' : 'divider'}
                borderRadius="m"
                backgroundColor={(props.editable === false) ? 'disabledBackground' : undefined}
            >
                <RNTextInput 
                    ref={ref}
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
                />
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
});

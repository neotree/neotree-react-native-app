import React from 'react';
import { 
    TextInput as RNTextInput, 
    TextInputProps as RNTextInputProps 
} from 'react-native';
import { Box, useTheme } from '../Theme';

export type TextInputProps = RNTextInputProps & {
    size?: 's' | 'm' | 'l';
};

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>((
    { 
        size,
        style,
        ...props
    }: TextInputProps,
    ref
) => {
    size = size || 'm';

    const theme = useTheme();

    return (
        <Box
            borderWidth={1}
            borderColor="divider"
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
    );
});

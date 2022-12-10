import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme, Theme } from './theme';
import { Typography } from './Typography';

export type InputProps = TextInputProps & {
    rounded: keyof Theme['rounded'];
    label?: string;
    error?: boolean;
    helperText?: string;
};

export function Input({ 
    rounded,
    label,
    helperText,
    error,
    ...props 
}: InputProps) {
    const theme = useTheme();

    return (
        <View>
            {!!label && (
                <Typography
                    size="xs"
                    color="text.secondary"
                    style={{
                        marginBottom: theme.spacing.xs,
                    }}
                >{label}</Typography>
            )}

            <TextInput 
                {...props}
                style={[
                    {
                        fontSize: theme.textSize.sm,
                        padding: theme.spacing.md,
                        borderWidth: 1,
                        borderColor: error ? theme.colors.error : theme.colors.divider,
                        borderRadius: theme.rounded[rounded],
                        backgroundColor: props.editable === false ? theme.colors.disabled : 'transparent',
                        color: props.editable === false ? theme.colors['text.disabled'] : theme.colors['text.primary'],
                    }
                ]}
            />

            {!!helperText && (
                <Typography
                    size="xs"
                    color={error ? 'error' : 'text.secondary'}
                    style={{
                        marginBottom: theme.spacing.xs,
                    }}
                >{helperText}</Typography>
            )}
        </View>
    );
}

Input.defaultProps = {
    rounded: 'md',
};

import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Text, useTheme } from '../Theme';

export type RadioProps = {
    onChange?: (value?: number | string) => void;
    value?: number | string;
    checked?: boolean;
    label?: React.ReactNode;
}

export function Radio({
    onChange,
    value,
    checked,
    label,
}: RadioProps) {
    const theme = useTheme();

    return (
        <TouchableOpacity
            onPress={() => onChange && onChange(value)}
        >
            <Box flexDirection="row" alignItems="center">
                <Box 
                    width={24}
                    height={24}
                    borderWidth={2}
                    borderColor={checked ? 'primary' : 'divider'}
                    backgroundColor={checked ? "primary" : undefined}
                    alignItems="center"
                    justifyContent="center"
                    style={{ borderRadius: 12 }}
                >
                    {checked && <Icon name="check" size={16} color={theme.colors.primaryContrastText} />}
                </Box>

                {label && (
                    <Box marginLeft="l">
                        {['number', 'string'].includes(typeof label) ? <Text>{label}</Text> : label}
                    </Box>
                )}
            </Box>
        </TouchableOpacity>
    )
}

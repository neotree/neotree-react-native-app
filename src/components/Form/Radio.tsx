import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Text, useTheme } from '../Theme';

export type RadioProps = {
    onChange?: (value?: number | string) => void;
    value?: number | string;
    checked?: boolean;
    label?: React.ReactNode;
    disabled?: boolean;
}

export function Radio({
    onChange,
    value,
    checked,
    label,
    disabled,
}: RadioProps) {
    const theme = useTheme();

    return (
        <TouchableOpacity
            onPress={() => onChange && onChange(value)}
            disabled={disabled}
        >
            <Box flexDirection="row" alignItems="center">
                <Box 
                    width={24}
                    height={24}
                    borderWidth={2}
                    borderColor={disabled ? 'divider' : (checked ? 'primary' : 'divider')}
                    backgroundColor={disabled ? 'disabledBackground' : (checked ? "primary" : undefined)}
                    alignItems="center"
                    justifyContent="center"
                    style={{ borderRadius: 12 }}
                >
                    {checked && <Icon name="check" size={16} color={disabled ? theme.colors.textDisabled : theme.colors.primaryContrastText} />}
                </Box>

                {label && (
                    <Box marginLeft="m">
                        {['number', 'string'].includes(typeof label) ? <Text>{label}</Text> : label}
                    </Box>
                )}
            </Box>
        </TouchableOpacity>
    )
}

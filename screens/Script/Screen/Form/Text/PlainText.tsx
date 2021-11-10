import React from 'react';
import { useTheme, View, TextField, Text } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function PlainText({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
            <Text color={'textPrimary'}>{field.label}</Text>
            <View>
                <TextField 
                    variant="outlined"
                />
            </View>
        </>
    );
}

import React from 'react';
import { useTheme, View, TextField } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function PlainText({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
            <View>
                <TextField 
                    variant="outlined"
                    label={field.label}
                />
            </View>
        </>
    );
}

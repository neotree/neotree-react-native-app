import React from 'react';
import { useTheme, View, TextField, Text } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function FieldNumber({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const [error, setError] = React.useState(null);

    let maxDecimals = 0;
    if (field.format) maxDecimals = `${field.format}`.replace(/[^#]+/gi, '').length;

    return (
        <>
            <View>
                <TextField 
                    variant="outlined"
                    autoCapitalize="none"
                    keyboardType={maxDecimals ? 'decimal-pad' : 'numeric'}
                />
            </View>
        </>
    );
}

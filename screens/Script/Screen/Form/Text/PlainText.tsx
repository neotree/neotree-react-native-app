import React from 'react';
import { View, TextField } from '@/components/ui';
import { ScreenFormFieldComponentProps } from '../../../types';

export function PlainText({ field, onChange, value, conditionMet, }: ScreenFormFieldComponentProps) {
    const [error] = React.useState(null);

    return (
        <>
            <View>
                <TextField 
                    variant="outlined"
                    autoCorrect={false}
                    editable={conditionMet}
                    value={value || ''}
                    defaultValue={value || ''}
                    error={!!error}
                    helperText={error}
                    onChange={e => {
                        const value = e.nativeEvent.text;
                        onChange(value, {
                            error,
                            valueText: value,
                        });
                    }}
                />
            </View>
        </>
    );
}

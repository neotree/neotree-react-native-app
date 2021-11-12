import React from 'react';
import { View, TextField } from '@/components/ui';
import { ScreenFormFieldComponentProps } from '../../../types';

export function FieldNumber({
    field,
    onChange,
    value,
    conditionMet,
  }: ScreenFormFieldComponentProps) {
    const [error, setError] = React.useState(null);

    let maxDecimals = 0;
    if (field.format) maxDecimals = `${field.format}`.replace(/[^#]+/gi, '').length;

    return (
        <>
            <View>
                <TextField 
                    editable={conditionMet}
                    variant="outlined"
                    autoCapitalize="none"
                    keyboardType={maxDecimals ? 'decimal-pad' : 'numeric'}
                    error={!!error}
                    helperText={error}
                    value={value || ''}
                    defaultValue={value || ''}
                    autoCorrect={false}
                    onChange={e => {
                        const value = e.nativeEvent.text;
                        let err = null;
                        if (value) {
                            const v = Number(value);
                            const decimals = value.split('.').filter((n, i) => i > 0).join('');
                            if (value.indexOf(' ') > -1) {
                                err = 'No spaces allowed'
                            } else if (isNaN(v)) {
                                err = 'Input is not a number';
                            } else if (field.maxValue && (v > Number(field.maxValue))) {
                                err = `Max value ${field.maxValue}`;
                            } else if (field.minValue && (v < Number(field.minValue))) {
                                err = `Min value ${field.minValue}`;
                            } else if (maxDecimals && (decimals.length > maxDecimals)) {
                                err = `Number should have only ${maxDecimals} decimal places.`;
                            } else if (!maxDecimals && value.indexOf('.') > -1) {
                                err = 'Decimal places not allowed.'
                            }
                        }
                        setError(err);
                        onChange(value, { error: err, valueText: value });
                    }}
                />
            </View>
        </>
    );
}

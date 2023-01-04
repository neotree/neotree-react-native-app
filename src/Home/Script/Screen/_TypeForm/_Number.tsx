import React from 'react';
import { Box, TextInput } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type NumberFieldProps = types.ScreenFormTypeProps & {
    
};

export function NumberField({ field }: NumberFieldProps) {
    const ctx = useContext();

    let maxDecimals = 0;
  if (field.format) maxDecimals = `${field.format}`.replace(/[^#]+/gi, '').length;

    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState('');

    return (
        <Box>
            <TextInput
                label={field.label}
                value={value}
                keyboardType="numeric"
                errors={error ? [error] : []}
                onChangeText={value => {                    
                    let err = '';
                    if (value) {
                        const v = Number(value);
                        const decimals = value.split('.').filter((n, i) => i > 0).join('');
                        if (value.indexOf(' ') > -1) {
                            err = 'No spaces allowed'
                        } else if (isNaN(v)) {
                            err = 'Input is not a number';
                        } else if (field.maxValue && (v > field.maxValue)) {
                            err = `Max value ${field.maxValue}`;
                        } else if (field.minValue && (v < field.minValue)) {
                            err = `Min value ${field.minValue}`;
                        } else if (maxDecimals && (decimals.length > maxDecimals)) {
                            err = `Number should have only ${maxDecimals} decimal places.`;
                        } else if (!maxDecimals && value.indexOf('.') > -1) {
                            err = 'Decimal places not allowed.'
                        }
                    }
                    setValue(value);
                    setError(err);
                }}
            />
        </Box>
    );
}

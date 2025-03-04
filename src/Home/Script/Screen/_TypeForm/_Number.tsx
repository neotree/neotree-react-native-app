import React from 'react';
import { Box, TextInput } from '@/src/components';
import * as types from '@/src/types';
import { evalMath } from '@/src/utils/eval-math';

type NumberFieldProps = types.ScreenFormTypeProps & {
    
};

export function NumberField({ field, onChange, conditionMet, entryValue, allValues }: NumberFieldProps) {
    const mounted = React.useRef(false);
    let maxDecimals = 0;
    if (field.format) maxDecimals = `${field.format}`.replace(/[^#]+/gi, '').length;

    const [value, setValue] = React.useState(entryValue?.value);
    const [error, setError] = React.useState('');
    const [calcFrom, setCalcFrom] = React.useState<types.ScreenEntryValue[]>([]);
    
    const onValueChange = React.useCallback((_value: string | number) => {
        const value = `${_value}`;
        let err = '';
        if (value) {
            const v = Number(value);
            const decimals = value.split('.').filter((_, i) => i > 0).join('');
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
        onChange({ value: err ? null : value, exportType: 'number', });
    }, [onChange, field, maxDecimals]);

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ value: null, valueText: null, exportType: 'number', }); 
            setValue(null);
        }
    }, [conditionMet]);

    React.useEffect(() => {
        const fieldCalc = field.calculation || '';

        const _calcFrom = allValues.filter(v => fieldCalc.toLowerCase().includes(`$${v.key}`.toLowerCase()));
        if (fieldCalc && (!mounted.current || JSON.stringify(_calcFrom) !== JSON.stringify(calcFrom))) {
          setCalcFrom(_calcFrom);

          const { result } = evalMath(fieldCalc, allValues);
          const value = result === null ? '' : (!maxDecimals ? Math.round(result!) : result!);
          onValueChange(value);
        }
        mounted.current = true;
      }, [allValues, calcFrom, field, maxDecimals, onValueChange]);

    return (
        <Box>
            <TextInput
                label={`${field.label || ''}${field.optional ? '' : ' *'}`}
                value={value}
                keyboardType="numeric"
                errors={error ? [error] : []}
                editable={conditionMet}
                onChangeText={value => {                    
                    onValueChange(value);
                }}
            />
        </Box>
    );
}

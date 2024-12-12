import React from 'react';
import { Box, TextInput } from '../../../../components';
import * as types from '../../../../types';

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

          const totalCalcItems = fieldCalc.split(',').length;

          let sum = _calcFrom.reduce((acc: number, e) => {
            let v = e.value;
            v = v === null ? 0 : v;
            v = isNaN(Number(v)) ? 0 : Number(v);
            acc += v;
            return acc;
          }, 0);

          let average = sum / (totalCalcItems || 1);

          sum = !maxDecimals ? Math.round(sum) : sum;
          average = !maxDecimals ? Math.round(average) : average;

          let subtract = _calcFrom.reduce((acc: number, e, i) => {
            let v = e.value;
            v = v === null ? 0 : v;
            v = isNaN(Number(v)) ? 0 : Number(v);

            if (i === 0) return v;

            acc -= v;
            return acc;
          }, 0);

          subtract = !maxDecimals ? Math.round(subtract) : subtract;

          // TODO: if null, should v = 0?
          let multiply = _calcFrom.reduce((acc: number, e, i) => {
            let v = e.value;
            v = v === null ? 1 : v;
            v = isNaN(Number(v)) ? 1 : Number(v);

            if (i === 0) return v;

            acc *= v;
            return acc;
          }, 0);

          multiply = !maxDecimals ? Math.round(multiply) : multiply;

          let divide = _calcFrom.reduce((acc: number, e, i) => {
            let v = e.value;
            v = v === null ? 0 : v;
            v = isNaN(Number(v)) ? 0 : Number(v);

            if (i === 0) return v;

            acc = acc / (v || 1);
            return acc;
          }, 0);

          divide = !maxDecimals ? Math.round(divide) : divide;          

          if (fieldCalc.toLowerCase().includes('sum')) {
            onValueChange(sum);
          } else if (fieldCalc.toLowerCase().includes('average')) {
            onValueChange(average);
          } else if (fieldCalc.toLowerCase().includes('multiply')) {
            onValueChange(multiply);
          } else if (fieldCalc.toLowerCase().includes('subtract')) {
            onValueChange(subtract);
          } else if (fieldCalc.toLowerCase().includes('divide')) {
            onValueChange(divide);
          } else {
            let v = _calcFrom[0]?.value;
            v = v === null ? '' : v;
            v = isNaN(v) ? '' : v;
            onValueChange(v);
          }
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

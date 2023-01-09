import React from 'react';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';
import { diffHours } from '../../../../utils/diffHours';

type PeriodFieldProps = types.ScreenFormTypeProps & {
    
};

function dateToValueText(value: null | Date) {
    let _value = value ? diffHours(new Date(value), new Date()) : null;
    _value = value ? ((_value || 0) < 1 ? 1 : _value) : null;
    let days = 0;
    let hrs = 0;
    let valueText = [];
    if (_value) {
        days = Math.floor(_value / 24);
        hrs = Math.floor(_value % 24);
        if (days) valueText.push(`${days} day(s)`);
        if (hrs) valueText.push(`${hrs} hour(s)`);
    }
    return value ? valueText.map(t => t).join(', ') : '';
}

export function PeriodField({ field, conditionMet, onChange, entryValue }: PeriodFieldProps) {
    const [value, setValue] = React.useState<Date | null>(entryValue?.value ? new Date(entryValue.value) : null);
    const [valueText, setValueText] = React.useState(entryValue?.valueText);

    React.useEffect(() => { setValueText(dateToValueText(value)); }, [value]);

    React.useEffect(() => { 
        if (!conditionMet) onChange({ value: null, valueText: null, }); 
        setValue(null);
    }, [conditionMet]);

    return (
        <Box>
            <DatePicker
                mode="datetime"
                value={value}
                disabled={!conditionMet}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={date => {
                    setValue(date);
                    onChange({
                        value: !date ? null : date.toISOString(),
                        valueText: dateToValueText(date),
                    });
                }}
                valueText={valueText}
                maxDate="date_now"
            />
        </Box>
    );
}

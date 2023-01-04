import React from 'react';
import { Box, DatePicker } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';
import { diffHours } from '../../../../utils/diffHours';

type PeriodFieldProps = types.ScreenFormTypeProps & {
    
};

export function PeriodField({ field, conditionMet }: PeriodFieldProps) {
    const ctx = useContext();

    const [value, setValue] = React.useState<Date | null>(null);
    const [valueText, setValueText] = React.useState('');

    React.useEffect(() => {
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
        setValueText(value ? valueText.map(t => t).join(', ') : '');
    }, [value]);

    return (
        <Box>
            <DatePicker
                mode="datetime"
                value={value}
                disabled={!conditionMet}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={date => setValue(date)}
                valueText={valueText}
                maxDate="date_now"
            />
        </Box>
    );
}

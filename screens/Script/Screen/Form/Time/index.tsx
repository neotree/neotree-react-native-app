import React from 'react';
import { DatePicker } from '@/components/DatePicker';
import * as copy from '@/constants/copy/script';
import { ScreenFormFieldComponentProps } from '../../../types';

export function Time({ 
    field, 
    onChange: _onChange, 
    value, 
    conditionMet, 
}: ScreenFormFieldComponentProps) {
    const onChange = (d, opts?: any) => _onChange(d, {
        ...opts,
        valueText: d ? require('moment')(new Date(d)).format('HH:mm') : '',
    });

    const [date, setDate] = React.useState(field.defaultValue ? value || new Date() : value);

    const onDateChange = (date) => {
        setDate(date);
        onChange(date);
    };

    React.useEffect(() => {
        const v = value ? new Date(value).toISOString() : null;
        const d = date ? new Date(date).toISOString() : null;
        if (v !== d) onChange(date);
    });

    return (
        <>
            <DatePicker
                mode="time"
                disabled={!conditionMet}
                label={copy.SELECT_DATE_AND_TIME}
                value={date || null}
                onChange={date => onDateChange(date)}
            />
        </>
    );
}

import React from 'react';
import { DatePicker } from '@/components/DatePicker';
import * as copy from '@/constants/copy/script';
import { ScreenFormFieldComponentProps } from '../../../types';

export function DateTime({ 
    field, 
    onChange: _onChange, 
    value, 
    conditionMet, 
}: ScreenFormFieldComponentProps) {
    const onChange = (d, opts?: any) => _onChange(d, {
        ...opts,
        valueText: d ? require('moment')(new Date(d)).format('DD MMM, YYYY') : '',
    });
    const _date = value ? new Date(value) : null;
    const [date, setDate] = React.useState(field.defaultValue ? _date || new Date() : _date);

    const onDateChange = (date) => {
        setDate(date);
        onChange(date.toISOString());
    };

    React.useEffect(() => {
        const v = value ? new Date(value).toISOString() : null;
        const d = date ? new Date(date).toISOString() : null;
        if (v !== d) {
            if (d) {
                onChange(date);
            } else {
                onDateChange(new Date(value));
            }
        }
    });

    return (
        <>
            <DatePicker
                mode="datetime"
                value={date}
                disabled={!conditionMet}
                label={copy.SELECT_DATE_AND_TIME}
                onChange={date => date && onDateChange(date)}
                maxDate={field.maxDate}
                minDate={field.minDate}
            />
        </>
    );
}

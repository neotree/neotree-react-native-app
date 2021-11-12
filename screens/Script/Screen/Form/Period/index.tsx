import React from 'react';
import moment from 'moment';
import { DatePicker } from '@/components/DatePicker';
import { ScreenFormFieldComponentProps } from '../../../types';

const formatDate = d => {
    if (!d) return '';
    const now = moment();
    const days = now.diff(new Date(d), 'days');
    let hrs = now.diff(new Date(d), 'hours') - (days * 24);
    if (hrs < 1) hrs = 1;
    const v = [];
    if (days) v.push(`${days} day(s)`);
    v.push(hrs ? `${hrs} hour(s)` : days ? '' : moment(d).fromNow().replace(' ago', ''));
    return v.filter(s => s).join(', ');
  };

export function Period({ 
    form, 
    field, 
    onChange: _onChange, 
    conditionMet, 
    valueObject, 
}: ScreenFormFieldComponentProps) {
    const [date, setDate] = React.useState(null);
    const [calcFrom, setCalcFrom] = React.useState(null);

    const onChange = React.useCallback((d) => {
        const value = d ? Math.ceil((new Date().getTime() - new Date(d).getTime()) / (1000 * 60 * 60)) : null;
        _onChange(value, {
            error: null,
            // value,
            valueText: d ? formatDate(d) : null,
            exportValue: d ? formatDate(d) : null,
        });
    }, []);

    React.useEffect(() => {
        const _calcFrom = form.values.filter(v => `$${v.key}` === field.calculation)[0];
        if (JSON.stringify(_calcFrom) !== JSON.stringify(calcFrom)) {
            setCalcFrom(_calcFrom);
            onChange(_calcFrom?.value);
        }
    }, [form, calcFrom]);

    React.useEffect(() => { onChange(date); }, [date]);

    if (calcFrom) console.log(valueObject);

    return (
        <>
            <DatePicker
                mode="datetime"
                value={valueObject?.value}
                maxDate="date_now"
                valueText={valueObject?.valueText || ''}
                placeholder={valueObject?.valueText || ''}
                onChange={selectedDate => {
                    setDate(selectedDate);
                }}
                disabled={!!calcFrom || !conditionMet}
            />
        </>
    );
}

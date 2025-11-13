import React from 'react';
import moment from 'moment';

import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';
import { diffHours } from '../../../../utils/diffHours';

type PeriodFieldProps = types.ScreenFormTypeProps & {};

const normalizeKey = (input?: string | null) => {
    if (!input || typeof input !== 'string') return { token: null, key: null };
    const trimmed = input.trim();
    if (!trimmed) return { token: null, key: null };
    const key = trimmed.startsWith('$') ? trimmed.substring(1) : trimmed;
    return { token: key ? `$${key}` : null, key: key || null };
};

export function dateToValueText(value: null | Date, format: 'days_hours' | 'years_months' = 'days_hours') {
    format = format || 'days_hours';
  
    if (value) {
        const d = new Date(value).getTime();
        const hrs = moment().diff(d, 'hours', true);
        const days = moment().diff(d, 'days', true);
        const months = moment().diff(d, 'months', true);
        const years = moment().diff(d, 'years', true);

        if (format === 'days_hours') {
            if (hrs < 24) {
                const _hrs = hrs < 1 ? parseFloat(hrs.toFixed(2)) : Math.floor(hrs);
                return `${_hrs} hour${_hrs === 1 ? '' : 's'}`;
            } else if (hrs >= 24) {
                let _hrs = Math.round(hrs % 24);
                if (_hrs > 24) _hrs = 0;
                if (_hrs === 24) _hrs = 23;
                const _days = Math.floor(days);
                return `${_days} day${_days > 1 ? 's' : ''}${_hrs >= 1 ? ` ${_hrs} hour${_hrs > 1 ? 's' : ''}` : ``}`;
            }
        }

        if (format === 'years_months') {
            if (months < 12) {
                const _months = Math.floor(months);
                return `${_months} month${_months === 1 ? '' : 's'}`;
            } else if (months >= 12) {
                let _months = Math.round(months % 12);
                if (_months > 12) _months = 0;
                if (_months === 12) _months = 11;
                const _years = Math.floor(years);
                return `${_years} year${_years > 1 ? 's' : ''}${_months >= 1 ? ` ${_months} month${_months > 1 ? 's' : ''}` : ``}`;
            }
        }
    }

    return null;
}

export function PeriodField({
    field,
    conditionMet,
    onChange,
    entryValue,
    allValues,
    formIndex,
    formValues = [],
    onLinkedFieldChange,
}: PeriodFieldProps) {
    const [value, setValue] = React.useState<Date | null>(entryValue?.value ? new Date(entryValue.value) : null);
    const [valueText, setValueText] = React.useState(entryValue?.valueText);
    const [calcFrom, setCalcFrom] = React.useState<null | types.ScreenEntryValue>(null);

    const referenceFieldKey = React.useMemo(() => {
        const { key } = normalizeKey(field?.calculation || field?.refKey);
        return key;
    }, [field?.calculation, field?.refKey]);

    const syncLinkedField = React.useCallback(
        (date: Date | null) => {
            if (!referenceFieldKey || !onLinkedFieldChange) return;
            let formatted: string | null = null;
            if (date) {
                const type = calcFrom?.type || field?.type || 'datetime';
                switch (type) {
                    case 'date':
                        formatted = moment(date).format('YYYY-MM-DD');
                        break;
                    case 'time':
                        formatted = moment(date).format('HH:mm');
                        break;
                    default:
                        formatted = moment(date).format('YYYY-MM-DD HH:mm');
                        break;
                }
            }
            onLinkedFieldChange(referenceFieldKey, {
                label: calcFrom?.label,
                exportType: calcFrom?.type,
                value: date ? date.toISOString() : null,
                valueText: formatted,
                exportLabel: formatted,
                exportValue: formatted,
            });
        },
        [calcFrom?.label, calcFrom?.type, field?.type, onLinkedFieldChange, referenceFieldKey]
    );

    React.useEffect(() => { setValueText(dateToValueText(value, field.format)); }, [value, field.format]);

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ 
				value: null, 
				valueText: null, 
				calculateValue: null,
				exportValue: null,
                exportType: 'number',
			}); 
            setValue(null);
        }
    }, [conditionMet]);

    const normalizeEntries = React.useCallback((input: any): types.ScreenEntryValue[] => {
        if (!input) return [];
        const normalized: types.ScreenEntryValue[] = [];

        const pushEntry = (entry: any, keyOverride?: string) => {
            if (!entry) return;
            if (entry.key || keyOverride) {
                normalized.push({ ...(entry as any), key: (keyOverride || entry.key) as string });
                return;
            }
            if (typeof entry === 'object') {
                Object.entries(entry).forEach(([subKey, subValue]) => {
                    if (subValue && typeof subValue === 'object') {
                        normalized.push({ ...(subValue as any), key: subKey });
                    }
                });
            }
        };

        if (Array.isArray(input)) {
            input.forEach(item => pushEntry(item));
        } else {
            pushEntry(input);
        }

        return normalized;
    }, []);

    const scopedValues = React.useMemo(() => {
        const localValues = normalizeEntries(formValues);
        const globalValues = normalizeEntries(allValues);
        return [...localValues, ...globalValues];
    }, [allValues, formValues, normalizeEntries]);

    const getCalculationEntry = React.useCallback(
        (entries: types.ScreenEntryValue[], fieldCalc?: string | null): types.ScreenEntryValue | null => {
            const { key } = normalizeKey(fieldCalc);
            if (!key) return null;
            return entries.find(v => `${v?.key}`.toLowerCase() === key.toLowerCase()) || null;
        },
        []
    );

    React.useEffect(() => {
        const _calcFrom = getCalculationEntry(scopedValues, field.calculation || field.refKey);
        if (JSON.stringify(_calcFrom) !== JSON.stringify(calcFrom)) {
          setCalcFrom(_calcFrom);
          if (_calcFrom && _calcFrom.value) {
            try {
                const val = new Date(_calcFrom.value);
                setValue(val);
                setValueText(dateToValueText(val, field.format));
                onChange({ 
                    label:field?.label,
                    exportType: 'number',
					value: val.toISOString(), 
					valueText: dateToValueText(val, field.format), 
                    exportLabel:dateToValueText(val, field.format),
					exportValue: _calcFrom.value ? diffHours(new Date(_calcFrom.value), new Date()) : null,
      				calculateValue: _calcFrom.value ? diffHours(new Date(_calcFrom.value), new Date()) : null,
				});
            } catch(e) { /**/ }
          }
        }
      }, [calcFrom, field.calculation, field.format, field.refKey, getCalculationEntry, scopedValues]);

    return (
        <Box>
            <DatePicker
                mode="datetime"
                value={value}
                disabled={!conditionMet}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={date => {
                   const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());
                    const validDate = isValidDate(date) ? date : null;
                    setValue(validDate);
                    syncLinkedField(validDate);
                    onChange({
                        label:field?.label,
                        exportType: 'number',
                        value: !validDate ? null : validDate.toISOString(),
                        valueText: dateToValueText(validDate, field.format),
                        exportLabel:dateToValueText(validDate, field.format),
						exportValue: validDate ? diffHours(validDate, new Date()) : null,
      					calculateValue: validDate ? diffHours(validDate, new Date()) : null,
                    });
                }}
                valueText={valueText}
                maxDate="date_now"
            />
        </Box>
    );
}

import React from 'react';
import moment from 'moment';

import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';
import { diffHours, diffHours2 } from '../../../../utils/diffHours';

type PeriodFieldProps = types.ScreenFormTypeProps & {
    
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

export function PeriodField({ field, conditionMet, onChange, entryValue, allValues,formIndex }: PeriodFieldProps) {
    const [value, setValue] = React.useState<Date | null>(entryValue?.value ? new Date(entryValue.value) : null);
    const [valueText, setValueText] = React.useState(entryValue?.valueText);
    const [calcFrom, setCalcFrom] = React.useState<null | types.ScreenEntryValue>(null);

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

    function getValuesFromIndex<T>(array: T[], startIndex: number = 0): T[] {
        return array?.slice(startIndex);
      }

    function getCalculationEntry(data: any[],fieldCalc:any): any | null {
      
        const result = getValuesFromIndex(data,formIndex)?.find(v => {
            // Case 1: Object has explicit key property
            if (v.key && `$${v.key}` === fieldCalc) return true;
            
            // Case 2: Object is keyed by property name
            const objectKey = Object.keys(v).find(k => 
              typeof v[k] === 'object' && 
              `$${k}` === fieldCalc
            );
            return !!objectKey;
          });
          
          if (result && !result.key && fieldCalc) {
            const key = fieldCalc.substring(1); // Remove the '$' prefix
            if (result[key] && typeof result[key] === 'object') {
              return { key, ...result[key] };
            }
          }
          
          return result;
      }

    React.useEffect(() => {
        const _calcFrom =getCalculationEntry(allValues,field.calculation||field.refKey)
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
      }, [allValues, calcFrom, field.format]);

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

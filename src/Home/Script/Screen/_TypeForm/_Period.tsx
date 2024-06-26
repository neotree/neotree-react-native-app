import React from 'react';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';
import { diffHours, diffHours2 } from '../../../../utils/diffHours';

type PeriodFieldProps = types.ScreenFormTypeProps & {
    
};

function dateToValueText(value: null | Date) {
	return value ? diffHours2(Math.abs((new Date().getTime() - new Date(value).getTime()) / 1000)) : null;
    // let _value = value ? diffHours(new Date(value), new Date()) : null;
    // _value = value ? ((_value || 0) < 1 ? 1 : _value) : null;
    // let days = 0;
    // let hrs = 0;
    // let valueText = [];
    // if (_value) {
    //     days = Math.floor(_value / 24);
    //     hrs = Math.floor(_value % 24);
    //     if (days) valueText.push(`${days} day(s)`);
    //     if (hrs) valueText.push(`${hrs} hour(s)`);
    // }
    // return value ? valueText.map(t => t).join(', ') : '';
}

export function PeriodField({ field, conditionMet, onChange, entryValue, formValues }: PeriodFieldProps) {
    const [value, setValue] = React.useState<Date | null>(entryValue?.value ? new Date(entryValue.value) : null);
    const [valueText, setValueText] = React.useState(entryValue?.valueText);
    const [calcFrom, setCalcFrom] = React.useState<null | types.ScreenEntryValue>(null);

    React.useEffect(() => { setValueText(dateToValueText(value)); }, [value]);

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

    React.useEffect(() => {
        const _calcFrom = formValues.filter(v => `$${v.key}` === field.calculation)[0];
        if (JSON.stringify(_calcFrom) !== JSON.stringify(calcFrom)) {
          setCalcFrom(_calcFrom);
          if (_calcFrom && _calcFrom.value) {
            try {
                const val = new Date(_calcFrom.value);
                setValue(val);
                setValueText(dateToValueText(val));
                onChange({ 
                    exportType: 'number',
					value: val.toISOString(), 
					valueText: dateToValueText(val), 
					exportValue: _calcFrom.value ? diffHours(new Date(_calcFrom.value), new Date()) : null,
      				calculateValue: _calcFrom.value ? diffHours(new Date(_calcFrom.value), new Date()) : null,
				});
            } catch(e) { /**/ }
          }
        }
      }, [formValues, calcFrom]);

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
                        exportType: 'number',
                        value: !date ? null : date.toISOString(),
                        valueText: dateToValueText(date),
						exportValue: date ? diffHours(date, new Date()) : null,
      					calculateValue: date ? diffHours(date, new Date()) : null,
                    });
                }}
                valueText={valueText}
                maxDate="date_now"
            />
        </Box>
    );
}

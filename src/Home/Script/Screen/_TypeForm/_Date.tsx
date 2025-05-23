import React, { useCallback, useMemo } from 'react';
import moment from 'moment';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';

type DateFieldProps = types.ScreenFormTypeProps & {
    
};

export function DateField({ field, conditionMet, entryValue, allValues, onChange,repeatable,editable }: DateFieldProps) {
	const [mounted, setMounted] = React.useState(false);
    const [value, setValue] = React.useState<Date | null>(entryValue?.value ? new Date(entryValue.value) : null);
    const canEdit = repeatable?editable:true

    const getformattedDate = (type:any,value: Date)=>{
        switch(type) {
            case 'date':
                return require('moment')(new Date(value)).format('DD MMM, YYYY') ;
            case 'datetime':
                return require('moment')(new Date(value)).format('DD MMM, YYYY HH:mm');
            default:
                return null;
        }
    }

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ value: null, valueText: null, exportType: 'date', }); 
            setValue(null);
        } else {
			if (!mounted && (field.defaultValue === 'date_now')) {
				const date = new Date();
                const formatedDate = getformattedDate(field.type,date)
				onChange({ 
                    exportType: 'date',
					value: date,
					valueText: formatedDate,
                    valueLabel: formatedDate,
                    exportValue: formatedDate,
                    exportLabel: formatedDate,
				}); 
				setValue(date);
			}
	
			if (!mounted && (field.defaultValue === 'date_noon')) {
				const date = moment(new Date()).startOf('day').hour(12).minute(0).toDate();
				onChange({ 
                    exportType: 'date',
					value: date,
					valueText: (() => {
						switch(field.type) {
							case 'date':
								return require('moment')(new Date(date)).format('DD MMM, YYYY') ;
							case 'datetime':
								return require('moment')(new Date(date)).format('DD MMM, YYYY HH:mm');
							default:
								return null;
						}
					})(),
				}); 
				setValue(date);
			}
	
			if (!mounted && (field.defaultValue === 'date_midnight')) {
				const date = moment(new Date()).startOf('day').hour(0).minute(0).toDate();
				onChange({ 
                    exportType: 'date',
					value: date,
					valueText: (() => {
						switch(field.type) {
							case 'date':
								return require('moment')(new Date(date)).format('DD MMM, YYYY') ;
							case 'datetime':
								return require('moment')(new Date(date)).format('DD MMM, YYYY HH:mm');
							default:
								return null;
						}
					})(),
				}); 
				setValue(date);
			}
		}
    }, [conditionMet, field, mounted]);

	React.useEffect(() => { setMounted(true); }, []);

    const { minDate, maxDate } = useMemo(() => {
        let minDate = undefined;
        let maxDate = undefined;

        if (field.minDateKey) {
            let minDateKey = `${field.minDateKey || ''}`;
            minDateKey = `${minDateKey}`.charAt(0) === '$' ? `${minDateKey}`.substring(1, minDateKey.length) : minDateKey;
            let _minDate: Date | null = null;
            let _minDateType = 'datetime';
            allValues?.forEach(v => {
                if (`${v.key}`.toLowerCase() === `${minDateKey}`.toLowerCase()) {
                    _minDate = v.value ? new Date(v.value) : null;
                    _minDateType = v.type!;
                }
            });
            if (_minDate) {
                minDate = new Date(_minDate);
                if (_minDateType === 'date') {
                    minDate.setHours(0);
                    minDate.setMinutes(0);
                }
            }
        }

        if (field.maxDateKey) {
            let maxDateKey = `${field.maxDateKey || ''}`;
            maxDateKey = `${maxDateKey}`.charAt(0) === '$' ? `${maxDateKey}`.substring(1, maxDateKey.length) : maxDateKey;
            let _maxDate: Date | null = null;
            let _maxDateType = 'datetime';
            allValues?.forEach(v => {
                if (`${v.key}`.toLowerCase() === `${maxDateKey}`.toLowerCase()) {
                    _maxDate = v.value ? new Date(v.value) : null;
                    _maxDateType = v.type!;
                }
            });
            if (_maxDate) {
                maxDate = new Date(_maxDate);
                if (_maxDateType === 'date') {
                    maxDate.setHours(23);
                    maxDate.setMinutes(59);
                }
            }
        }

        return { minDate, maxDate, };
    }, [field, allValues]);

    const getErrors = useCallback((date: null | string) => {
        const errors = [];

        if (minDate && date && (new Date(date).getTime() < new Date(minDate).getTime())) {
            errors.push(`Date should be on or after the min date: ${moment(minDate).format(field.type === 'date' ? 'LL' : 'LLL')}`);
        }

        if (maxDate && date && (new Date(date).getTime() > new Date(maxDate).getTime())) {
            errors.push(`Date should be on or before the max date: ${moment(maxDate).format(field.type === 'date' ? 'LL' : 'LLL')}`);
        }

        return errors;
    }, [field.type, minDate, maxDate]);

    return (
        <Box>
            <DatePicker
                errors={getErrors(entryValue.value)}
                mode={field.type === 'date' ? 'date' : 'datetime'}
                value={value}
                disabled={!conditionMet || !canEdit}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={value => {
                    let date: null | Date = null;
                    if (value) {
                        const hour = moment(value).hours();
                        const minute = moment(value).minutes();
                        date = moment(value).startOf('day').add(hour, 'hour').add(minute, 'minute').toDate();
                    }
                    const error = getErrors(date?.toISOString?.() || null)[0] || null;
                    setValue(date);
                    onChange({
                        error,
                        exportType: 'date',
                        value: date ? date.toISOString?.() : null,
                        valueText: (() => {
                            if (!date) return null;
                            switch(field.type) {
                                case 'date':
                                    return require('moment')(new Date(date)).format('DD MMM, YYYY') ;
                                case 'datetime':
                                    return require('moment')(new Date(date)).format('DD MMM, YYYY HH:mm');
                                default:
                                    return null;
                            }
                        })(),
                    });
                }}
                maxDate={maxDate || field.maxDate}
                minDate={minDate || field.minDate}
            />
        </Box>
    );
}

import React from 'react';
import moment from 'moment';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';

type DateFieldProps = types.ScreenFormTypeProps & {
    
};

export function DateField({ field, conditionMet, entryValue, onChange, }: DateFieldProps) {
	const [mounted, setMounted] = React.useState(false);
    const [value, setValue] = React.useState<Date | null>(entryValue?.value ? new Date(entryValue.value) : null);

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ value: null, valueText: null, exportType: 'date', }); 
            setValue(null);
        } else {
			if (!mounted && (field.defaultValue === 'date_now')) {
				const date = new Date();
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

    return (
        <Box>
            <DatePicker
                mode={field.type === 'date' ? 'date' : 'datetime'}
                value={value}
                disabled={!conditionMet}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={date => {
                    setValue(date);
                    onChange({
                        exportType: 'date',
                        value: date ? date.toISOString() : null,
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
                maxDate={field.maxDate}
                minDate={field.minDate}
            />
        </Box>
    );
}

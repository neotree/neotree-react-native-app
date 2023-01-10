import React from 'react';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';

type DateFieldProps = types.ScreenFormTypeProps & {
    
};

export function DateField({ field, conditionMet, entryValue, onChange, }: DateFieldProps) {
    const [value, setValue] = React.useState<Date | null>(entryValue?.value ? new Date(entryValue.value) : null);

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ value: null, valueText: null, }); 
            setValue(null);
        }
    }, [conditionMet]);

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

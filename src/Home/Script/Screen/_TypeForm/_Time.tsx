import React from 'react';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';

type TimeFieldProps = types.ScreenFormTypeProps & {
    
};

export function TimeField({ field, conditionMet, onChange, entryValue }: TimeFieldProps) {
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
                mode="time"
                value={value}
                disabled={!conditionMet}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={d => {
                    setValue(d);
                    onChange({
                        value: !d ? null : d.toISOString(),
                        valueText: d ? require('moment')(new Date(d)).format('HH:mm') : ''
                    });
                }}
            />
        </Box>
    );
}

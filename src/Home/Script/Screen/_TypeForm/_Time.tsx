import React from 'react';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';

type TimeFieldProps = types.ScreenFormTypeProps & {
    
};

export function TimeField({ field, conditionMet, onChange }: TimeFieldProps) {
    const [value, setValue] = React.useState<Date | null>(null);

    React.useEffect(() => { 
        if (!conditionMet) onChange({ value: null, valueText: null, }); 
        setValue(null);
    }, [conditionMet]);

    return (
        <Box>
            <DatePicker
                mode="time"
                value={value}
                disabled={!conditionMet}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={date => setValue(date)}
            />
        </Box>
    );
}

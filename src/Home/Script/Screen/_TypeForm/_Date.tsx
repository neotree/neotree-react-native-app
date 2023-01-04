import React from 'react';
import { Box, DatePicker } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type DateFieldProps = types.ScreenFormTypeProps & {
    
};

export function DateField({ field, conditionMet }: DateFieldProps) {
    const ctx = useContext();

    const [value, setValue] = React.useState<Date | null>(null);

    return (
        <Box>
            <DatePicker
                mode={field.type === 'date' ? 'date' : 'datetime'}
                value={value}
                disabled={!conditionMet}
                label={`${field.label}${field.optional ? '' : ' *'}`}
                onChange={date => setValue(date)}
                maxDate={field.maxDate}
                minDate={field.minDate}
            />
        </Box>
    );
}

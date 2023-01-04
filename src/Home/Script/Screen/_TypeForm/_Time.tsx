import React from 'react';
import { Box, DatePicker } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type TimeFieldProps = types.ScreenFormTypeProps & {
    
};

export function TimeField({ field, conditionMet }: TimeFieldProps) {
    const ctx = useContext();

    const [value, setValue] = React.useState<Date | null>(null);

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

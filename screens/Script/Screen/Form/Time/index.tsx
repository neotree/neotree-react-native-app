import React from 'react';
import { useTheme } from '@/components/ui';
import { DatePicker } from '@/components/DatePicker';
import * as copy from '@/constants/copy/script';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function Time({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const [date, setDate] = React.useState(null);

    return (
        <>
            <DatePicker
                mode="time"
                label={copy.SELECT_DATE_AND_TIME}
                onChange={date => {}}
            />
        </>
    );
}

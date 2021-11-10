import React from 'react';
import { useTheme } from '@/components/ui';
import { DatePicker } from '@/components/DatePicker';
import * as copy from '@/constants/copy/script';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function FieldDate({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const [date, setDate] = React.useState(null);

    return (
        <>
            <DatePicker
                label={copy.SELECT_DATE}
                onChange={date => {}}
            />
        </>
    );
}

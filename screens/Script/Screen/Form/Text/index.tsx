import React from 'react';
import { useTheme } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';
import { UID } from './UID';
import { PlainText } from './PlainText';

export function FieldText(props: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
        
        </>
    );
}

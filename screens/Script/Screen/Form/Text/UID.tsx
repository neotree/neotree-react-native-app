import React from 'react';
import { useTheme } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function UID(props: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
        
        </>
    );
}

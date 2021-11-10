import React from 'react';
import { useTheme } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function DropDown(props: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
        
        </>
    );
}

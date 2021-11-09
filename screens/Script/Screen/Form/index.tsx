import React from 'react';
import { useTheme } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../types';

export function Form(props: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
        
        </>
    );
}

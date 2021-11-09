import React from 'react';
import { useTheme } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../types';

export function List(props: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
        
        </>
    );
}

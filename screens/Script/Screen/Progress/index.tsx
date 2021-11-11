import React from 'react';
import { useTheme } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../../types';

export function Progress({ setEntry }: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    React.useEffect(() => { setEntry({ values: [] }); }, []);

    return (
        <>
        
        </>
    );
}

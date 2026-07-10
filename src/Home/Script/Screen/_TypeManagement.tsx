import React from 'react';

import { useScriptContext } from '@/src/contexts/script';
import { Box, ManagementScreen } from '../../../components';
import * as types from '../../../types';

type TypeManagementProps = types.ScreenTypeProps & {};

export function TypeManagement(_props: TypeManagementProps) {
    const { activeScreen, activeScreenEntry, setEntryValues, getFieldPreferences, setMoreNavOptions } = useScriptContext();
   
    const metadata = activeScreen?.data?.metadata;

    React.useEffect(() => {
        if (!activeScreen?.id) return;
        if (`${activeScreenEntry?.screen?.id}` === `${activeScreen.id}`) return;
        setEntryValues([]);
    }, [activeScreen?.id, activeScreenEntry?.screen?.id, setEntryValues]);
    React.useLayoutEffect(() => {
        setMoreNavOptions(prev => {
            if (
                prev?.showFAB === true &&
                prev?.hideSearch === true &&
                prev?.goNext === undefined
            ) {
                return prev;
            }

            return {
                ...prev,
                showFAB: true,
                hideSearch: true,
                goNext: undefined,
            };
        });
    }, [activeScreen?.id, setMoreNavOptions]);

    return (
        <Box>
            <ManagementScreen 
                data={{
                    ...metadata,
                    text1Style: getFieldPreferences('text1')?.style,
                    text2Style: getFieldPreferences('text2')?.style,
                    text3Style: getFieldPreferences('text3')?.style,
                }}
            />
        </Box>
    );
}

import React from 'react';

import { useScriptContext } from '@/src/contexts/script';
import { Box, ManagementScreen } from '../../../components';
import * as types from '../../../types';

type TypeManagementProps = types.ScreenTypeProps & {
    
};

export function TypeManagement({}: TypeManagementProps) {
    const { activeScreen, setEntryValues, getFieldPreferences } = useScriptContext();
   
    const metadata = activeScreen?.data?.metadata;

    React.useEffect(() => { setEntryValues([]); }, [metadata]);

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

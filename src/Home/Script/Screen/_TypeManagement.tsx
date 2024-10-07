import React from 'react';
import { Box, ManagementScreen } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeManagementProps = types.ScreenTypeProps & {
    
};

export function TypeManagement({}: TypeManagementProps) {
    const ctx = useContext();
   
    const metadata = ctx.activeScreen?.data?.metadata;

    React.useEffect(() => { ctx.setEntryValues([]); }, [metadata]);

    return (
        <Box>
            <ManagementScreen 
                data={{
                    ...metadata,
                    text1Style: ctx.getFieldPreferences('text1')?.style,
                    text2Style: ctx.getFieldPreferences('text2')?.style,
                    text3Style: ctx.getFieldPreferences('text3')?.style,
                }}
            />
        </Box>
    );
}

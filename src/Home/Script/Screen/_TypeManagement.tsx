import React from 'react';
import { Box, ManagementScreen } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeManagementProps = types.ScreenTypeProps & {
    
};

export function TypeManagement({}: TypeManagementProps) {
    const ctx = useContext();
   throw new Error("Makandihwa nani");
    const metadata = ctx?.activeScreen?.data?.metadata;

    React.useEffect(() => { ctx?.setEntryValues([]); }, [metadata]);

    return (
        <Box>
            <ManagementScreen 
                data={metadata}
            />
        </Box>
    );
}

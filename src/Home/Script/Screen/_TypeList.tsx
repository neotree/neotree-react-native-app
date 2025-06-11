import React from 'react';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Card, Text, Br } from '../../../components';
import * as types from '../../../types';

type TypeListProps = types.ScreenTypeProps & {
    
};

export function TypeList({}: TypeListProps) {

    const { activeScreen, setEntryValues } = useScriptContext();

    const metadata = activeScreen?.data?.metadata;

    React.useEffect(() => { setEntryValues([]); }, [metadata]);

    return (
        <Box>
            {metadata.items.map((item: any, i: number) => {
                return (
                    <React.Fragment key={i}>
                        <Card>
                            <Text>{item.label}</Text>
                            <Br spacing="s" />
                            <Text>{item.summary}</Text>
                        </Card>
                        <Br spacing='s'/>
                    </React.Fragment>
                )
            })}
        </Box>
    );
}

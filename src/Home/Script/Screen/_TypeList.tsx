import React from 'react';
import { Box, Card, Text, Br } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeListProps = types.ScreenTypeProps & {
    
};

export function TypeList({}: TypeListProps) {
    const ctx = useContext();

    const metadata = ctx?.activeScreen?.data?.metadata;

    React.useEffect(() => { ctx?.setEntryValues([]); }, [metadata]);

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
                        <Br />
                    </React.Fragment>
                )
            })}
        </Box>
    );
}

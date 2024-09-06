import React from 'react';
import { Box, Fab, FormAndDiagnosesSummary, PrintSession,PrintBarCode,Br} from '../../../components';
import { useContext } from '../Context';

export function Summary() {
    const ctx = useContext();

    const summary = ctx.summary;

    React.useEffect(() => {
        ctx.setMoreNavOptions({
            title: 'SUMMARY',
            headerRight: () => <><PrintBarCode session={summary}/> <Br/><PrintSession session={summary} showConfidential /></>,
        });
    }, [summary]);

    return (
        <Box flex={1} backgroundColor="white">
            <FormAndDiagnosesSummary
                session={summary}
                showConfidential
            />

            <Box 
                position="absolute"
                bottom={10}
                right={20}
            >
                <Fab 
                    icon={ctx.summary ? 'check' : undefined}
                    onPress={() => {
                        ctx.navigation?.navigate('Home');                         
                    }} 
                />
            </Box>
        </Box>
    );
}

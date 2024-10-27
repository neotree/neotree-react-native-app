import React from 'react';
import { Box, Fab, FormAndDiagnosesSummary, PrintSession,PrintBarCode,Br} from '../../../components';
import { useContext } from '../Context';

export function Summary() {
    const {summary,setMoreNavOptions,navigation} = useContext()||{};


    React.useEffect(() => {
        setMoreNavOptions({
            title: 'SUMMARY',
            headerRight: () => <><PrintBarCode session={summary}/><Box width={120}></Box><PrintSession session={summary} showConfidential /></>,
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
                    icon={summary ? 'check' : undefined}
                    onPress={() => {
                        navigation?.navigate('Home');                         
                    }} 
                />
            </Box>
        </Box>
    );
}

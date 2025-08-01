import React from 'react';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useScriptContext } from '@/src/contexts/script';

import { Box, useTheme, Text } from '../../../components';
import * as types from '../../../types';

type TypeProgressProps = types.ScreenTypeProps & {
    
};

export function TypeProgress({}: TypeProgressProps) {
    const theme = useTheme();
    const { activeScreen,setEntryValues } = useScriptContext();

    const metadata = activeScreen?.data?.metadata;

    React.useEffect(() => { setEntryValues([]); }, [metadata]);

    return (
        <Box>
            {metadata.items.map((item: any, i: number) => {
                return (
                    <React.Fragment key={i}>
                        <Box 
                            flexDirection="row"
                            paddingVertical="m"
                        >
                            <Box>
                                <Icon
                                    name="check-circle-outline"
                                    size={24}
                                    color={theme.colors[item.checked ? 'success' : 'grey-400']}
                                />
                            </Box>

                            <Box marginLeft="m">
                                <Text variant="title3">{item.label}</Text>
                            </Box>
                        </Box>
                    </React.Fragment>
                )
            })}
        </Box>
    );
}

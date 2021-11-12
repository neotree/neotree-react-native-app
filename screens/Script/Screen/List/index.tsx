import React from 'react';
import { Br, Text, useTheme, View } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../../types';

export function List({ setEntry }: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();
    const metadata = { ...activeScreen.data.metadata };

    React.useEffect(() => { setEntry({ values: [] }); }, []);

    return (
        <>
            {(metadata.items || []).map((item, i) => (
                <View key={i}>
                    <View
                        mb={theme.spacing()}
                        style={{ 
                            paddingVertical: theme.spacing(),
                        }}
                    >
                        <Text>{item.label}</Text>
                        <Text color="textSecondary">{item.summary}</Text>
                    </View>
                    <Br />
                </View>
            ))}
        </>
    );
}

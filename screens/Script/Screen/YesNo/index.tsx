import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, Text, Br, View } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../../types';

export function YesNo(props: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const options = [
        { value: 'true', label: activeScreen.data?.metadata.positiveLabel || 'Yes' },
        { value: 'false', label: activeScreen.data?.metadata.negativeLabel || 'No' },
    ];

    return (
        <>
            {options.map(o => (
                <React.Fragment key={o.value}>
                    <View variant="elevated">
                        <TouchableOpacity 
                            style={{ padding: theme.spacing(), }}
                        >
                            <Text
                                variant="subtitle1"
                                style={{ textAlign: 'center' }}
                            >{o.label}</Text>
                        </TouchableOpacity>
                    </View>
                    <Br />
                </React.Fragment>
            ))}
        </>
    );
}

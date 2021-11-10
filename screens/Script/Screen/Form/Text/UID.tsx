import React from 'react';
import { useTheme, View, TextField, Text } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function UID({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    return (
        <>
            <View
                style={{ flexDirection: 'row', alignItems: 'center' }}
            >
                <View
                    style={{ flex: 1 }}
                >
                    <TextField 
                        variant="outlined"
                        placeholder="e.g. AA02"
                    />
                </View>

                <Text
                    color="disabled"
                    style={{ marginHorizontal: theme.spacing() }}
                >-</Text>

                <View
                    style={{ flex: 1 }}
                >
                    <TextField 
                        variant="outlined"
                        placeholder="e.g. BB20"
                    />
                </View>
            </View>
        </>
    );
}

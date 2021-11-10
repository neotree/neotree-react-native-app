import React from 'react';
import { useTheme, View, Text } from '@/components/ui';
import { Picker } from '@react-native-picker/picker';
import * as copy from '@/constants/copy/script';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function DropDown({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const options = (field.values || '').split('\n')
        .map((v = '') => v.trim())
        .filter(v => v)
        .map(v => {
            const stringArr = v.split(',');
            return { value: stringArr[0], label: stringArr[1] };
        });

    return (
        <>
            <View
                variant="outlined"
            >
                <Picker
                    mode="dialog"
                    selectedValue={null}
                    onValueChange={value => {}}
                    style={{
                        width: '100%',
                        height: 50,
                        justifyContent: 'center'
                    }}
                >
                    <Picker.Item style={{ color: theme.palette.action.disabled }} value="" label={copy.SELECT} />
                    {options.map(o => (
                        <Picker.Item key={o.value} label={o.label} value={o.value} />
                    ))}
                </Picker>
            </View>
        </>
    );
}

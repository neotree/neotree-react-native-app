import React from 'react';
import { useTheme, View, Text } from '@/components/ui';
import { Picker } from '@react-native-picker/picker';
import * as copy from '@/constants/copy/script';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';

export function DropDown({ field, onChange, value, conditionMet, }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const pickerRef = React.useRef(null);
    const [error] = React.useState(null);

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
                style={[
                    conditionMet ? {} : { backgroundColor: theme.palette.action.disabledBackground, },
                ]}
            >
                <Picker
                    enabled={conditionMet}
                    mode="dialog"
                    selectedValue={value}
                    onValueChange={v => onChange(v.value, {
                        error: null,
                        valueLabel: v.label,
                        valueText: !v ? null : v.label,
                    })}
                    style={{
                        width: '100%',
                        height: 50,
                        justifyContent: 'center',
                    }}
                >
                    <Picker.Item 
                        style={{ color: theme.palette.action.disabled }} 
                        value={value} 
                        label={copy.SELECT} 
                    />
                    {options.map(o => (
                        <Picker.Item 
                            key={o.value} 
                            label={o.label} 
                            value={o.value} 
                            style={conditionMet ? {} : { color: theme.palette.action.disabled }}
                        />
                    ))}
                </Picker>
            </View>
        </>
    );
}

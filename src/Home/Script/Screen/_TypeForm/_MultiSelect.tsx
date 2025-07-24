import { useCallback, useMemo, useEffect, useState, } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Card, Text, Br, TextInput } from '@/src/components';
import * as types from '@/src/types';
import { fieldsTypes } from '@/src/constants';

type MultiSelectFieldProps = types.ScreenFormTypeProps & {
    
};

export function MultiSelectField({ field, conditionMet, repeatable, editable, entryValue, onChange, }: MultiSelectFieldProps) {
    const canEdit = repeatable ? editable : true;

    const { opts, } = useMemo(() => {
        let opts: { 
            value: string; 
            label: string; 
            option?: { 
                key: string;
                label: string; 
            },
        }[] = (field.values || '').split('\n')
            .map((v = '') => v.trim())
            .filter((v: any) => v)
            .map((v: any) => {
                v = v.split(',');
                const option = (field.valuesOptions || []).find((o: any) => `${o.key}` === `${v[0]}`);
                return { 
                    value: v[0], 
                    label: v[1], 
                    option: !option ? undefined : {
                        label: option.optionLabel,
                        key: option.optionKey,
                    },
                };
            });

        opts = opts?.filter((o, i) => i === opts?.map(o => o.value).indexOf(o.value));

        return {
            opts,
        };
    }, [field]);

   const getValue = useCallback(() => {
    return opts.reduce((acc, o) => {
        const values = Array.isArray(entryValue?.value) ? entryValue.value : [];
        const match = values.find((v: types.ScreenEntryValue) => v?.key === o.value);
        return {
            ...acc,
            [o.value]: match,
        };
    }, {} as {
        [key: string]: undefined | types.ScreenEntryValue;
    });
}, [opts, entryValue, conditionMet]);


    const [value, setValue] = useState(getValue());

    useEffect(() => { 
        if (!conditionMet) {
            onChange({ 
                value: null,
                valueText: null, 
                valueLabel: null, 
                exportType: fieldsTypes.MULTI_SELECT, 
            }); 
            setValue(getValue());
        }
    }, [conditionMet]);

    // useEffect(() => {
    //     setValue(getValue());
    // }, [getValue]);

    return (
        <Box>
            <Text mb="m">{`${field.label || ''}${field.optional ? '' : ' *'}`}</Text>

            {opts.map(o => {
                const isSelected = value[o.value];
                const disabled = !canEdit;

                const { value2, key2, } = { ...value[o.value] };

                return (
                    <Box 
                        key={o.value}
                        {...(!(isSelected && o.option) ? undefined : {
                            backgroundColor: 'bg.active',
                            p: 'l',
                            borderRadius: 's',
                        })}
                    >
                        <TouchableOpacity 
                            disabled={disabled}
                            onPress={() => {
                                const state = {
                                    ...value,
                                    [o.value]: value[o.value] ? undefined : {
                                        value: o.value,
                                        key: o.value,
                                        // valueLabel: o.label,
                                        valueText: o.label,
                                        exportLabel: o.label,
                                        value2: o.option ? '' : undefined,
                                        key2: o.option ? '' : undefined,
                                    },
                                };

                                setValue(state);

                                const values = Object.values(state).filter(v => v).map(v => ({
                                    ...v,
                                }));

                                onChange({
                                    value: !values.length ? undefined : values,
                                });
                            }}
                        >
                            <Card 
                                backgroundColor={disabled ? 'disabledBackground' : (isSelected ? 'primary' : undefined)}
                            >
                                <Text
                                    color={disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : undefined)}
                                    textAlign="center"
                                    variant="title3"
                                >{o.label}</Text>
                            </Card>
                        </TouchableOpacity>

                        {isSelected && o.option && (
                            <>
                                <Br spacing="m" />

                                <Box>
                                    <TextInput
                                        label={`${o.option.label || ''}`}
                                        value={value2 || ''}
                                        onChangeText={value2 => {
                                            setValue(prev => ({
                                                ...prev,
                                                [o.value]: !prev[o.value] ? undefined : {
                                                    ...prev[o.value]!,
                                                    value2,
                                                    key2: !value2 ? '' : (key2 || ''),
                                                },
                                            }));

                                            if (entryValue) {
                                                onChange({
                                                    value: (entryValue?.value || []).map((v: types.ScreenEntryValue) => v.key !== o.value ? v : {
                                                        ...v,
                                                        value2,
                                                        key2,
                                                    })
                                                });
                                            }
                                        }}
                                    />
                                </Box>
                            </>
                        )}

                        <Br spacing="l" />

                    </Box>
                )
            })}
        </Box>
    );
}

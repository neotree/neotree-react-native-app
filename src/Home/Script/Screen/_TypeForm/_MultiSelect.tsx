import { useCallback, useMemo, useEffect, useState, } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Card, Text, Br, TextInput } from '@/src/components';
import * as types from '@/src/types';
import { fieldsTypes } from '@/src/constants';
import { useScriptContext } from '@/src/contexts/script';
import { parseFieldValues, parseFieldItems } from '@/src/utils/script-fields-and-items';

type MultiSelectFieldProps = types.ScreenFormTypeProps & {
    
};

export function MultiSelectField({ 
    field, 
    conditionMet, 
    repeatable, 
    editable, 
    entryValue, 
    onChange, 
}: MultiSelectFieldProps) {
    const canEdit = repeatable ? editable : true;

    const ctx = useScriptContext();

    const listStyle = ctx?.activeScreen?.data?.listStyle || 'none';

    const opts = useMemo(() => {
        if (!field?.items) {
            return parseFieldValues({
                values: field.values,
                options: field.valuesOptions,
            });
        } else {
            return parseFieldItems({ items: field.items, });
        }
    }, [field]);

   const getValue = useCallback(() => {
    return opts.reduce((acc, o) => {
        const values = Array.isArray(entryValue?.value) ? entryValue.value : [];
        const match = values.find((v: types.ScreenEntryValue) => v?.key === o.value);
        return {
            ...acc,
            [o.value]: !conditionMet ? undefined : match,
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
                const exclusiveSelected = Object.values(value).find(o => o?.exclusive);

                const isSelected = value[o.value];
                const disabled = !canEdit || !conditionMet || (exclusiveSelected && !isSelected);

                const { value2, } = { ...value[o.value] };

                return (
                    <Box 
                        key={o.itemId}
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
                                    ...(o.exclusive ? {} : value),
                                    [o.value]: value[o.value] ? undefined : {
                                        value: o.value,
                                        key: o.value,
                                        // valueLabel: o.label,
                                        valueText: o.label,
                                        exportLabel: o.label,
                                        value2: o.option ? '' : undefined,
                                        key2: o.option ? '' : undefined,
                                        parentKey: field.key,
                                        exclusive: o.exclusive,
                                        enterValueManually: o.enterValueManually,
                                    },
                                };

                                setValue(state);

                                const values = Object.values(state).filter(v => v).map(v => ({
                                    ...v,
                                }));

                                onChange({
                                    value: !values.length ? undefined : values,
                                    listStyle,
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

                        {isSelected && o.enterValueManually && (
                            <>
                                <Br spacing="m" />

                                <Box>
                                    <TextInput
                                        label={`${o.option?.label || ''}`}
                                        value={value2 || ''}
                                        onChangeText={value2 => {
                                            setValue(prev => ({
                                                ...prev,
                                                [o.value]: !prev[o.value] ? undefined : {
                                                    ...prev[o.value]!,
                                                    value2,
                                                    key2: !value2 ? '' : (o.option?.key || ''),
                                                },
                                            }));

                                            if (entryValue) {
                                                onChange({
                                                    value: (entryValue?.value || []).map((v: types.ScreenEntryValue) => v.key !== o.value ? v : {
                                                        ...v,
                                                        value2,
                                                        key2: o.option?.key || '',
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

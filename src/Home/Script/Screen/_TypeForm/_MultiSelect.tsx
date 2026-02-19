import { useCallback, useMemo, useEffect, useState, } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { Box, Card, Text, Br, TextInput } from '@/src/components';
import * as types from '@/src/types';
import { fieldsTypes } from '@/src/constants';
import { parseFieldValues, parseFieldItems } from '@/src/utils/script-fields-and-items';
import { getSelectionConflicts, getSelectionConflictMessage } from '@/src/utils/selection-rules';

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
                                const isSelecting = !value[o.value];
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

                                if (isSelecting) {
                                    const selectedValues = Object.keys(state).filter(key => state[key]);
                                    const conflicts = getSelectionConflicts({
                                        items: opts,
                                        selectedValues,
                                    });
                                    if (conflicts.length) {
                                        Alert.alert('Selection not allowed', getSelectionConflictMessage(conflicts));
                                        return;
                                    }
                                }

                                setValue(state);

                                const selectedValues = Object.values(state).filter(v => v);
                                
                                // Validate that all selected items with enterValueManually have value2 filled
                                const hasInvalidSelection = selectedValues.some((v: any) => 
                                    v?.enterValueManually && !v?.value2?.trim()
                                );

                                if (!selectedValues.length || hasInvalidSelection) {
                                    onChange({
                                        value: undefined,
                                    });
                                } else {
                                    const values = selectedValues.map(v => ({
                                        ...v,
                                    }));

                                    onChange({
                                        value: values,
                                    });
                                }
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
                                        label={`Specify ${o?.label}`}
                                        value={value2 || ''}
                                        onChangeText={value2 => {
                                            const updatedState = {
                                                ...value,
                                                [o.value]: !value[o.value] ? undefined : {
                                                    ...value[o.value]!,
                                                    value2,
                                                    key2: !value2 ? '' : (o.option?.key || ''),
                                                },
                                            };

                                            setValue(updatedState);

                                            const selectedValues = Object.values(updatedState).filter(v => v);
                                            
                                            // Validate that all selected items with enterValueManually have value2 filled
                                            const hasInvalidSelection = selectedValues.some((v: any) => 
                                                v?.enterValueManually && !v?.value2?.trim()
                                            );

                                            if (!selectedValues.length || hasInvalidSelection) {
                                                onChange({
                                                    value: undefined,
                                                });
                                            } else {
                                                const values = selectedValues.map((v: any) => ({
                                                    ...v,
                                                }));

                                                onChange({
                                                    value: values,
                                                });
                                            }
                                        }}
                                        errors={!value2?.trim() ? ['This field is required'] : undefined}
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

import { useCallback, useMemo, useEffect, useRef, useState, } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Card, Text, Br, TextInput, useTheme } from '@/src/components';
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
    const theme = useTheme();
    const canEdit = repeatable ? editable : true;
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [search, setSearch] = useState({
        show: false,
        value: '',
    });

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
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const clearScheduledSync = useCallback(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
        }
    }, [syncTimeoutRef]);

    const emitSelectionState = useCallback((state: Record<string, undefined | types.ScreenEntryValue>) => {
        // Supersede any pending debounced sync so its stale state can't fire
        // after this emission and silently drop a just-toggled selection.
        clearScheduledSync();

        const selectedValues = Object.values(state).filter((v): v is types.ScreenEntryValue => !!v);
        const hasInvalidSelection = selectedValues.some(v =>
            v?.enterValueManually && !`${v?.value2 || ''}`.trim()
        );

        if (!selectedValues.length || hasInvalidSelection) {
            onChange({
                value: undefined,
            });
            return;
        }

        onChange({
            value: selectedValues.map(v => ({
                ...v,
            })),
        });
    }, [clearScheduledSync, onChange]);

    const scheduleSelectionSync = useCallback((state: Record<string, undefined | types.ScreenEntryValue>, immediate = false) => {
        clearScheduledSync();

        if (immediate) {
            emitSelectionState(state);
            return;
        }

        syncTimeoutRef.current = setTimeout(() => {
            emitSelectionState(state);
            syncTimeoutRef.current = null;
        }, 180);
    }, [clearScheduledSync, emitSelectionState]);

    useEffect(() => { 
        if (!conditionMet) {
            clearScheduledSync();
            onChange({ 
                value: null,
                valueText: null, 
                valueLabel: null, 
                exportType: fieldsTypes.MULTI_SELECT, 
            }); 
            setValue(getValue());
        }
    }, [clearScheduledSync, conditionMet, getValue, onChange]);

    useEffect(() => {
        return () => {
            clearScheduledSync();
        };
    }, [clearScheduledSync]);

    // useEffect(() => {
    //     setValue(getValue());
    // }, [getValue]);

    return (
        <Box>
            <View
                style={{
                    flexDirection: 'row',
                    columnGap: 8,
                }}
            >
                <Box flex={1}>
                    <Text mb="m">
                        {`${field.label || ''}${field.optional ? '' : ' *'}`}
                    </Text>
                </Box>
                
                {!search.show && (
                    <TouchableOpacity
                        onPress={() => setSearch(prev => ({
                            ...prev,
                            show: true,
                            value: '',
                        }))}
                    >
                        <Icon 
                            size={24} 
                            name="search"
                            color={theme.colors.primary} 
                        />
                    </TouchableOpacity>
                )}
            </View>

            {search.show && (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: 8,
                        marginTop: 10,
                        marginBottom: 20,
                    }}
                >
                    <View style={{ flex: 1, }}>
                        <TextInput
                            placeholder="Search"
                            onChangeText={value => setSearch(prev => ({
                                ...prev,
                                value,
                            }))}
                            returnKeyType="search"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => setSearch(prev => ({
                            ...prev,
                            show: false,
                            value: '',
                        }))}
                    >
                        <Icon 
                            size={24} 
                            name="close"
                        />
                    </TouchableOpacity>
                </View>
            )}

            {opts.map(o => {
                const exclusiveSelected = Object.values(value).find(o => o?.exclusive);

                const isSelected = value[o.value];
                const disabled = !canEdit || !conditionMet || (exclusiveSelected && !isSelected);

                const { value2, } = { ...value[o.value] };
                const manualLabel = `${o.enterValueManuallyLabel || ''}`.trim() || `Specify ${o?.label}`;

                const hide = search.value ? !`${o.label}`.match(new RegExp(search.value, 'gi')) : false;

                if (hide) return null;

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

                                emitSelectionState(state);
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
                                        label={manualLabel}
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
                                            scheduleSelectionSync(updatedState);
                                        }}
                                        onBlur={() => {
                                            scheduleSelectionSync(valueRef.current, true);
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

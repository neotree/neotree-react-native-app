import React, { useRef } from 'react';
import { Alert, TouchableOpacity } from 'react-native';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Br, Card, Text, TextInput } from '../../../components';
import * as types from '../../../types';
import { getSelectionConflictMessage, getSelectionConflicts } from '@/src/utils/selection-rules';

type TypeMultiSelectProps = types.ScreenTypeProps & {
    
};

export function TypeMultiSelect({ searchVal }: TypeMultiSelectProps) {
    const autoFilled = useRef(false);
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const {
        activeScreen,
        activeScreenEntry,
        mountedScreens,
        getPrepopulationData,
        setEntryValues
    } = useScriptContext();
    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen?.data?.printable !== false;

    let cachedVal = (activeScreenEntry?.values || [])[0]?.value || [];
	if (cachedVal && !cachedVal.map) cachedVal = [cachedVal];

    const canAutoFill = !mountedScreens[activeScreen?.id];
    const matched = getPrepopulationData();

    const [value, setValue] = React.useState<Record<string, any>>(cachedVal.reduce((acc: any, v: any) => ({
        ...acc,
        [v.value]: v,
    }), {}));
    const valueRef = useRef(value);

    React.useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const clearScheduledSync = React.useCallback(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
        }
    }, []);

    const syncValue = React.useCallback((_value: typeof value) => {
        // Supersede any pending debounced sync so its stale state can't fire
        // after this emission and silently drop a just-toggled selection.
        clearScheduledSync();

        const keys = Object.keys(_value).filter(key => _value[key]);

        // Validate that all selected items with enterValueManually have value2 filled
        const hasInvalidSelection = keys.some(key => {
            const item = metadata.items.find((item: any) => (
                (item.id === key) ||
                (item.key === key)
            ));
            return item?.enterValueManually && !_value[key]?.value2?.trim();
        });

		const values = keys.reduce((acc: types.ScreenEntryValue[], key) => {
            const value2 = _value[key]?.value2;
            const item = metadata.items.filter((item: any) => (
                (item.id === key) ||
                (item.key === key)
            ))[0];
            
            return [
                ...acc,
                {
                    value: key,
                    value2: value2 || '',
                    valueText: item?.label,
                    // valueLabel: metadata.label,
                    label: item?.label,
                    key: item?.id,
					inputKey: metadata.key,
                    dataType: item?.dataType,
                    exclusive: item?.exclusive,
                    confidential: item?.confidential,
                    exportType: 'multi_select',
                },
            ];
        }, []);

        // Only set entry values if validation passes (no items requiring manual entry are missing value2)
        const entryValues = (!keys.length || hasInvalidSelection) ? undefined : [
			{
                printable,
				value: values,
				key: metadata.key,
				label: metadata.label,
				type: metadata.dataType,
			}
		];

        setValue(values.reduce((acc, v) => ({
            ...acc,
            [v.key]: v,
        }), {} as Record<string, any>));

        setEntryValues?.(entryValues);
    }, [clearScheduledSync, metadata, printable, setEntryValues]);

    const scheduleValueSync = React.useCallback((_value: typeof value, immediate = false) => {
        clearScheduledSync();

        if (immediate) {
            syncValue(_value);
            return;
        }

        syncTimeoutRef.current = setTimeout(() => {
            syncValue(_value);
            syncTimeoutRef.current = null;
        }, 180);
    }, [clearScheduledSync, syncValue]);

    const opts: any[] = metadata.items.map((item: any,index: number) => {
        return {
            label: item.label,
            value: item.id,
            key: index,
            hide: searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false,
            exclusive: item.exclusive,
            enterValueManually: item.enterValueManually,
            enterValueManuallyLabel: item.enterValueManuallyLabel,
            disabled: (() => {
                const exclusive = metadata.items.reduce((acc: any, item: any) => {
                if (item.exclusive) acc = item.id;
                    return acc;
                }, null);
                return exclusive && value[exclusive] ? exclusive !== item.id : false;
            })(),
            onChange: () => {
                const isSelecting = !value[item.id];
                let form = { ...value };
                if (item.exclusive) {
                    form = { [item.id]: !form[item.id], };
                } else {
                    form = { ...form, [item.id]: !form[item.id], }; 
                }

                if (isSelecting) {
                    const selectedValues = Object.keys(form).filter(key => form[key]);
                    const conflicts = getSelectionConflicts({
                        items: metadata.items || [],
                        selectedValues,
                    });

                    if (conflicts.length) {
                        Alert.alert('Selection not allowed', getSelectionConflictMessage(conflicts));
                        return;
                    }
                }
                syncValue(form);
            },
          };
    });

    React.useEffect(() => {
    }, [metadata?.key, opts]);

    React.useEffect(() => {
        if (canAutoFill && !autoFilled.current) {
            const _value: any = {};
            const _matched = matched[metadata.key]?.values?.value || [];
            _matched.forEach((m: string) => { _value[m] = true; });
            if (_matched.length) syncValue(_value);
            autoFilled.current = true;
        }
    }, [canAutoFill, matched, metadata, syncValue]);

    React.useEffect(() => {
        return () => {
            clearScheduledSync();
        };
    }, [clearScheduledSync]);

    return (
        <Box>
            {opts.map(o => {
                if (o.hide) return null;

                const _value = value[o.value];

                const isSelected = !!_value;
                const manualLabel = `${o.enterValueManuallyLabel || ''}`.trim() || `${o.label || ''} (Required)`;

                return (
                    <React.Fragment key={o.key}>
                        <TouchableOpacity 
                            disabled={o.disabled}
                            onPress={() => o.onChange()}
                        >
                            <Card 
                                backgroundColor={o.disabled ? 'disabledBackground' : (isSelected ? 'primary' : undefined)}
                            >
                                <Text
                                    color={o.disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : undefined)}
                                    textAlign="center"
                                    variant="title3"
                                >{o.label}</Text>
                            </Card>
                        </TouchableOpacity>

                        {!!_value && o.enterValueManually && (
                            <>
                                <Br spacing="m" />

                                <Box>
                                    <TextInput
                                        label={manualLabel}
                                        value={_value.value2 || ''}
                                        onChangeText={value2 => {
                                            const nextState = { ...value, [o.value]: { ..._value, value2 } };
                                            setValue(nextState);
                                            scheduleValueSync(nextState);
                                        }}
                                        onBlur={() => {
                                            scheduleValueSync(valueRef.current, true);
                                        }}
                                        errors={!_value.value2?.trim() ? ['This field is required'] : undefined}
                                    />
                                </Box>
                            </>
                        )}

                        <Br spacing="l" />
                    </React.Fragment>
                )
            })}
        </Box>
    );
}

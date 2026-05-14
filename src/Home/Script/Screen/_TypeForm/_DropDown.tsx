import React, { useMemo } from 'react';

import { parseFieldItems, parseFieldValues } from '@/src/utils/script-fields-and-items';
import { Box, Br, Dropdown, TextInput } from '../../../../components';
import * as types from '../../../../types';

type DropDownFieldProps = types.ScreenFormTypeProps & {};

export function DropDownField({
    field,
    entryValue,
    conditionMet,
    repeatable,
    editable,
    onChange,
}: DropDownFieldProps) {
    const canEdit = repeatable ? editable : true;
    const onChangeRef = React.useRef(onChange);
    const manualCommitTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const opts = useMemo(() => {
        if (!field?.items) {
            return parseFieldValues({
                values: field.values,
                options: field.valuesOptions,
            });
        }

        return parseFieldItems({ items: field.items });
    }, [field]);

    const [localValue, setLocalValue] = React.useState({
        value: `${entryValue?.value || ''}`,
        value2: `${entryValue?.value2 || ''}`,
        key2: `${entryValue?.key2 || ''}`,
    });

    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const clearManualCommitTimeout = React.useCallback(() => {
        if (manualCommitTimeoutRef.current) {
            clearTimeout(manualCommitTimeoutRef.current);
            manualCommitTimeoutRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        if (!conditionMet) {
            clearManualCommitTimeout();
            onChangeRef.current({
                value: null,
                valueText: null,
                valueLabel: null,
                exportType: 'dropdown',
                exportLabel: null,
                exportValue: null,
                value2: null,
                key2: null,
                error: null,
            });
            setLocalValue({
                value: '',
                value2: '',
                key2: '',
            });
        }
    }, [clearManualCommitTimeout, conditionMet]);

    React.useEffect(() => {
        const nextState = {
            value: `${entryValue?.value || ''}`,
            value2: `${entryValue?.value2 || ''}`,
            key2: `${entryValue?.key2 || ''}`,
        };

        setLocalValue(current => {
            if (
                current.value === nextState.value &&
                current.value2 === nextState.value2 &&
                current.key2 === nextState.key2
            ) {
                return current;
            }

            return nextState;
        });
    }, [entryValue?.key2, entryValue?.value, entryValue?.value2]);

    const selected = useMemo(
        () => opts.find(o => `${o.value}` === `${localValue.value}`),
        [localValue.value, opts]
    );

    const manualLabel = `${selected?.enterValueManuallyLabel || ''}`.trim() || `Specify ${selected?.label || field.label || ''}`;
    const manualEntryMissing = !!selected?.enterValueManually && !`${localValue.value2 || ''}`.trim();

    const emitChange = React.useCallback((params: {
        value: string | number | null;
        valueText: string | number | null;
        exportLabel: string | number | null;
        exportValue: string | number | null;
        value2?: string | null;
        key2?: string | null;
    }) => {
        const requiresManualEntry = !!selected?.enterValueManually;
        const nextManualValue = `${params.value2 || ''}`;

        onChangeRef.current({
            exportType: 'dropdown',
            key: field.key,
            value: params.value,
            valueLabel: field.label,
            valueText: params.valueText,
            exportLabel: params.exportLabel,
            exportValue: params.exportValue,
            value2: params.value2 ?? null,
            key2: params.key2 ?? null,
            error: requiresManualEntry && !nextManualValue.trim() ? 'This field is required' : null,
        });
    }, [field.key, field.label, selected?.enterValueManually]);

    const commitManualValue = React.useCallback((value2: string, immediate = false) => {
        if (!selected?.enterValueManually) return;

        const nextKey2 = value2 ? (selected?.option?.key || '') : '';
        const flush = () => {
            emitChange({
                value: localValue.value || null,
                valueText: selected?.label || null,
                exportLabel: selected?.label || null,
                exportValue: localValue.value || null,
                value2,
                key2: nextKey2,
            });
        };

        clearManualCommitTimeout();

        if (immediate) {
            flush();
            return;
        }

        manualCommitTimeoutRef.current = setTimeout(() => {
            flush();
            manualCommitTimeoutRef.current = null;
        }, 180);
    }, [clearManualCommitTimeout, emitChange, localValue.value, selected]);

    React.useEffect(() => {
        return () => {
            clearManualCommitTimeout();
        };
    }, [clearManualCommitTimeout]);

    return (
        <Box
            {...(!(selected?.option || selected?.enterValueManually) ? undefined : {
                backgroundColor: 'bg.active',
                p: 'l',
                borderRadius: 's',
            })}
        >
            <Dropdown
                disabled={!conditionMet || !canEdit}
                label={`${field.label || ''}${field.optional ? '' : ' *'}`}
                title={`${field.label || ''}`}
                searchable={opts?.length > 5}
                value={localValue.value}
                options={opts}
                onChange={(val, option) => {
                    const requiresManualEntry = !!(option as any)?.enterValueManually;
                    const nextState = {
                        value: `${val || ''}`,
                        value2: '',
                        key2: '',
                    };

                    setLocalValue(nextState);

                    if (!val) {
                        onChangeRef.current({
                            exportType: 'dropdown',
                            value: null,
                            valueLabel: null,
                            valueText: null,
                            exportLabel: null,
                            exportValue: null,
                            value2: null,
                            key2: null,
                            error: null,
                        });
                        return;
                    }

                    onChangeRef.current({
                        exportType: 'dropdown',
                        key: field.key,
                        value: val,
                        valueLabel: field.label,
                        valueText: option.label,
                        exportLabel: option.label,
                        exportValue: val,
                        value2: requiresManualEntry ? '' : null,
                        key2: null,
                        error: requiresManualEntry ? 'This field is required' : null,
                    });
                }}
            />

            {!!selected?.enterValueManually && (
                <>
                    <Br spacing="m" />

                    <TextInput
                        editable={conditionMet && canEdit}
                        label={`${manualLabel}${field.optional ? '' : ' *'}`}
                        value={localValue.value2}
                        onChangeText={value2 => {
                            const nextState = {
                                value: localValue.value,
                                value2,
                                key2: value2 ? (selected?.option?.key || '') : '',
                            };

                            setLocalValue(nextState);
                            commitManualValue(value2);
                        }}
                        onBlur={() => {
                            commitManualValue(localValue.value2, true);
                        }}
                        errors={manualEntryMissing ? ['This field is required'] : []}
                    />
                </>
            )}
        </Box>
    );
}

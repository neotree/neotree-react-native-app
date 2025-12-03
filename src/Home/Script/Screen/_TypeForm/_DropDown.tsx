import React, { useMemo } from 'react';
import { parseFieldValues, parseFieldItems } from '@/src/utils/script-fields-and-items';
import { Box, Dropdown, Br, TextInput } from '../../../../components';
import * as types from '../../../../types';

type DropDownFieldProps = types.ScreenFormTypeProps & {
    
};

export function DropDownField({ 
    field, 
    entryValue,
    conditionMet,
    repeatable,
    editable,
    onChange,
}: DropDownFieldProps) {
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

    const [{ value, value2 }, setValue] = React.useState({
        value: `${entryValue?.value || ''}`,
        value2: `${entryValue?.value2 || ''}`,
        key2: `${entryValue?.key2 || ''}`,
    });

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ 
                value: null, 
                valueText: null, 
                valueLabel: null, 
                exportType: 'dropdown', 
            }); 
            setValue({
                value: '',
                value2: '',
                key2: '',
            });
        }
    }, [conditionMet]);

    const selected = useMemo(() => opts.find(o => o.value == value), [value, opts]);

    // Check if manual entry is required but not filled
    const hasInvalidManualEntry = selected?.enterValueManually && !value2?.trim();

    return (
        <Box
            {...(!selected?.option ? undefined : {
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
                value={value}
                options={opts}
                onChange={(val, o) => {
                    setValue({
                        value: `${val || ''}`,
                        value2: '',
                        key2: '',
                    });
                    
                    // Check if the newly selected option requires manual entry
                    const selectedOption = opts.find(opt => opt.value == val);
                    const requiresManualEntry = selectedOption?.enterValueManually;
                    
                    // Only set valid entry values if no manual entry required OR it's being cleared
                    if (!val || requiresManualEntry) {
                        onChange({
                            exportType: 'dropdown',
                            value: null,
                            valueLabel: null,
                            valueText: null,
                            exportLabel: null,
                            exportValue: null,
                        });
                    } else {
                        onChange({
                            exportType: 'dropdown',
                            value: val, 
                            valueLabel: field.label,
                            valueText: o.label,
                            exportLabel: o.label,
                            exportValue: val,
                        });
                    }
                }}
            />

            {!!selected?.enterValueManually && (
                <>
                    <Br spacing="m" />
                    
                    <Box>
                        <TextInput
                            multiline
                            label={`${selected.option?.label || ''} (Required)`}
                            value={value2 || ''}
                            onChangeText={newValue2 => {
                                const newKey2 = !newValue2 ? '' : (selected?.option?.key || '');
                                setValue(prev => ({
                                    ...prev,
                                    value2: newValue2,
                                    key2: newKey2,
                                }));
                                
                                // Only update entry values if value2 is filled
                                if (newValue2?.trim()) {
                                    onChange({
                                        exportType: 'dropdown',
                                        value: value,
                                        valueLabel: field.label,
                                        valueText: selected.label,
                                        exportLabel: selected.label,
                                        exportValue: value,
                                        value2: newValue2,
                                        key2: newKey2,
                                    });
                                } else {
                                    onChange({
                                        exportType: 'dropdown',
                                        value: null,
                                        valueLabel: null,
                                        valueText: null,
                                        exportLabel: null,
                                        exportValue: null,
                                    });
                                }
                            }}
                            errors={hasInvalidManualEntry ? ['This field is required'] : undefined}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}
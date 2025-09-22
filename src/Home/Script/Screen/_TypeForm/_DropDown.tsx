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
    const canEdit = repeatable?editable:true

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
                    onChange({
                        exportType: 'dropdown',
						value: val, 
						valueLabel: !val ? null : field.label,
          				valueText: !val ? null : o.label,
						exportLabel: !val ? null : o.label,
                        exportValue: !val ? null : val,
					});
                }}
            />

            {!!selected?.enterValueManually && (
                <>
                    <Br spacing="m" />
                    
                    <Box>
                        <TextInput
                            multiline
                            label={`${selected.option?.label || ''}`}
                            value={value2 || ''}
                            onChangeText={value2 => {
                                const key2 = !value2 ? '' : (selected?.option?.key || '');
                                setValue(prev => ({
                                    ...prev,
                                    value2,
                                    key2,
                                }));
                                onChange({ ...entryValue, value2, key2, });
                            }}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}

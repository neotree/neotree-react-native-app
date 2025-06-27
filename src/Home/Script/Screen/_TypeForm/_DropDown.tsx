import React, { useMemo } from 'react';
import { Box, Dropdown, Br, TextInput } from '../../../../components';
import * as types from '../../../../types';

type DropDownFieldProps = types.ScreenFormTypeProps & {
    
};

export function DropDownField({ field, entryValue, onChange, conditionMet,repeatable,editable }: DropDownFieldProps) {
    const canEdit = repeatable?editable:true

    const { opts, } = useMemo(() => {
        let opts: { 
            value: string; 
            label: string; 
            option?: { label: string; },
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
                    },
                };
            });

        opts = opts.filter((o, i) => i === opts.map(o => o.value).indexOf(o.value));

        return {
            opts,
        };
    }, [field]);

    const [{ value, value2 }, setValue] = React.useState({
        value: `${entryValue?.value || ''}`,
        value2: `${entryValue?.value2 || ''}`,
    });

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ value: null, valueText: null, valueLabel: null, exportType: 'dropdown', }); 
            setValue({
                value: '',
                value2: '',
            });
        }
    }, [conditionMet]);

    const selected = useMemo(() => opts.find(o => o.value == value), [value, opts]);

    return (
        <Box>
            <Dropdown
                disabled={!conditionMet || !canEdit}
                label={`${field.label || ''}${field.optional ? '' : ' *'}`}
                title={`${field.label || ''}`}
                searchable={opts?.length > 5}
                value={value}
                options={opts}
                onChange={(val) => {
                    setValue({
                        value: `${val || ''}`,
                        value2: '',
                    });
                    onChange({ 
                        exportType: 'dropdown',
						value: val, 
						valueLabel: !val ? null : opts.filter((o:any)=>o.value===val)[0]?.label,
          				valueText: !val ? null : opts.filter((o:any)=>o.value===val)[0]?.label,
						exportLabel: !val ? null : opts.filter((o:any)=>o.value===val)[0]?.label,
                        exportValue: !val ? null : val,
					});
                }}
            />

            {!!selected && selected?.option && (
                <>
                    <Br spacing="m" />
                    
                    <Box>
                        <TextInput
                            label={`${selected.option.label || ''} *`}
                            value={value2 || ''}
                            onChangeText={value2 => setValue(prev => ({
                                ...prev,
                                value2,
                            }))}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}

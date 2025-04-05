import React from 'react';
import { Box, Dropdown } from '../../../../components';
import * as types from '../../../../types';

type DropDownFieldProps = types.ScreenFormTypeProps & {
    
};

export function DropDownField({ field, entryValue, onChange, conditionMet,repeatable,editable }: DropDownFieldProps) {
    const [value, setValue] = React.useState(entryValue?.value);
    const canEdit = repeatable?editable:true
    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ value: null, valueText: null, valueLabel: null, exportType: 'dropdown', }); 
            setValue('');
        }
    }, [conditionMet]);

    const opts = (field.values || '').split('\n')
        .map((v = '') => v.trim())
        .filter((v: any) => v)
        .map((v: any) => {
            v = v.split(',');
            return { value: v[0], label: v[1], };
        });

    return (
        <Box>
            <Dropdown
                disabled={!conditionMet || !canEdit}
                label={`${field.label || ''}${field.optional ? '' : ' *'}`}
                title={`${field.label || ''}`}
                searchable={opts.length > 5}
                value={value}
                options={opts}
                onChange={(val, o) => {
                    setValue(`${val || ''}`);
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
        </Box>
    );
}

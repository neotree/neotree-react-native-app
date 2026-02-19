import React, { useMemo } from 'react';
import { parseFieldValues, parseFieldItems } from '@/src/utils/script-fields-and-items';
import { Box, Dropdown} from '../../../../components';
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
            return parseFieldItems({ items: field.items });
        }
    }, [field]);

    const [{ value }, setValue] = React.useState({
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
                value2: null
            }); 
            setValue({
                value: '',
                value2: '',
                key2: '',
            });    
        }
    }, [conditionMet,field]);

    const selected = useMemo(
        () => opts.find(o => o.value == value),
        [value, opts]
    );

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


                    if (!val) {
                        onChange({
                            exportType: 'dropdown',
                            value: null,
                            valueLabel: null,
                            valueText: null,
                            exportLabel: null,
                            exportValue: null,
                            value2: null
                        });
                    } else {
                       
                        onChange({
                            exportType: 'dropdown',
                            value: val,
                            key: field.key,
                            valueLabel: field.label,
                            valueText: o.label,
                            exportLabel: o.label,
                            exportValue: val,
                            value2: '' // initially empty until user types
                        });
                    }
                }}
            />

        </Box>
    );
}

import React from 'react';
import { Box, NeotreeIDInput, TextInput } from '../../../../components';
import * as types from '../../../../types';
import { useContext } from '../../Context';

type TextFieldProps = types.ScreenFormTypeProps & {
    
};

export function TextField({ field, conditionMet, entryValue, onChange }: TextFieldProps) {
    const ctx = useContext();
    const isNeotreeID = field.key.match('UID') || field.key.match('NUID_') || field.key.match(new RegExp('neotree', 'gi'));

	const prePopulatedUID = ''; // ctx.matched?.prePopulateWithUID ? ctx.matched?.uid : '';

    const [value, setValue] = React.useState(entryValue?.value || (isNeotreeID ? prePopulatedUID : '') || '');
    const [error, setError] = React.useState('');

    React.useEffect(() => { 
        if (!conditionMet) {
            onChange({ value: null, valueText: null, exportType: 'text', }); 
            setValue('');
        }
    }, [conditionMet]);

    return (
        <Box>
            {isNeotreeID ? (
                <NeotreeIDInput 
                    disabled={!conditionMet}
                    defaultValue={prePopulatedUID}
                    label={`${field.label}${field.optional ? '' : ' *'}`}
                    value={value}
                    application={ctx.application}
                    onChange={val => {
                        setValue(`${val || ''}`);
                        onChange({ value: val, exportType: 'text', });
                    }}
                    autoGenerateValue={!!field.defaultValue}

                />
            ) : (
                <TextInput
                    editable={conditionMet}
                    label={`${field.label}${field.optional ? '' : ' *'}`}
                    value={value}
                    errors={error ? [error] : []}
                    onChangeText={value => {                    
                        let err = '';
                        setValue(value);
                        setError(err);
                        onChange({ value: err ? null : value, exportType: 'text', });
                    }}
                />
            )}
        </Box>
    );
}

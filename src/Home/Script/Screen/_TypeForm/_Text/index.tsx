import React from 'react';
import { Box, NeotreeIDInput, TextInput } from '../../../../../components';
import * as types from '../../../../../types';

type TextFieldProps = types.ScreenFormTypeProps & {
    
};

export function TextField({ field }: TextFieldProps) {
    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState('');

    const isNeotreeID = field.key.match('UID') || field.key.match('NUID_') || field.key.match(new RegExp('neotree', 'gi'));

    return (
        <Box>
            {isNeotreeID ? (
                <NeotreeIDInput 
                    label={`${field.label}${field.optional ? '' : ' *'}`}
                    value={value}
                    onChange={value => setValue(value)}
                    autoGenerateValue={!!field.defaultValue}
                />
            ) : (
                <TextInput
                    label={`${field.label}${field.optional ? '' : ' *'}`}
                    value={value}
                    errors={error ? [error] : []}
                    onChangeText={value => {                    
                        let err = '';
                        setValue(value);
                        setError(err);
                    }}
                />
            )}
        </Box>
    );
}

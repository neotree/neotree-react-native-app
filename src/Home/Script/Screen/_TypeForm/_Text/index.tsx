import React from 'react';
import { Box, TextInput } from '../../../../../components';
import { useContext } from '../../../Context';
import * as types from '../../../../../types';

type TextFieldProps = types.ScreenFormTypeProps & {
    
};

export function TextField({ field }: TextFieldProps) {
    const ctx = useContext();

    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState('');

    return (
        <Box>
            <TextInput
                label={field.label}
                value={value}
                errors={error ? [error] : []}
                onChangeText={value => {                    
                    let err = '';
                    setValue(value);
                    setError(err);
                }}
            />
        </Box>
    );
}

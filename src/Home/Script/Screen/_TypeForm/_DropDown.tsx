import React from 'react';
import { Box, Dropdown } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type DropDownFieldProps = types.ScreenFormTypeProps & {
    
};

export function DropDownField({ field }: DropDownFieldProps) {
    const ctx = useContext();

    const [value, setValue] = React.useState('');

    const opts = (field.values || '').split('\n')
        .map((v = '') => v.trim())
        .filter((v: any) => v)
        .map((v: any) => {
            v = v.split(',');
            return { value: v[0], label: v[1] };
        });

    return (
        <Box>
            <Dropdown
                label={`${field.label || ''}${field.optional ? '' : ' *'}`}
                title={`${field.label || ''}`}
                searchable={opts.length > 5}
                value={value}
                options={opts}
                onChange={val => setValue(`${val || ''}`)}
            />
        </Box>
    );
}

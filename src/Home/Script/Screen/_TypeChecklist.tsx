import React from 'react';
import { Box } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeChecklistProps = types.ScreenTypeProps & {
    
};

export function TypeChecklist({}: TypeChecklistProps) {
    const ctx = useContext();

    const metadata = ctx?.activeScreen?.data?.metadata;

    return (
        <Box>

        </Box>
    );
}

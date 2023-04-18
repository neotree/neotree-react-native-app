import React from 'react';
import { Box, Theme } from './Theme';

export type BrProps = {
    spacing: keyof Theme['spacing'];
};

export function Br({ spacing }: BrProps) {
    return (
        <Box
            marginBottom={spacing}
        />
    );
}

const defaultProps: BrProps = {
    spacing: 's',
};

Br.defaultProps = defaultProps;

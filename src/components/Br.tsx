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
    spacing: 'm',
};

Br.defaultProps = defaultProps;

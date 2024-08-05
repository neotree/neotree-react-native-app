import React from 'react';
import { Box, Theme } from './Theme';

export type BrProps = {
    spacing: keyof Theme['spacing'];
};

export function Br({ spacing = 's' }: BrProps) {
    return (
        <Box
            marginBottom={spacing}
        />
    );
}

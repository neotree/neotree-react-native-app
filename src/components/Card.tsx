import React from 'react';
import { Box, Theme } from './Theme';

export type CardProps = React.PropsWithChildren<{
    backgroundColor?: keyof Theme['colors'];
}>;

export function Card({ children, backgroundColor }: CardProps) {
    return (
        <Box
            padding="m"
            elevation={24}
            shadowColor="grey-400"
            shadowOffset={{ width: -2, height: 4 }}
            shadowOpacity={0.2}
            shadowRadius={3}
            backgroundColor={backgroundColor || 'white'}
            borderRadius="s"
        >
            {children}
        </Box>
    );
}

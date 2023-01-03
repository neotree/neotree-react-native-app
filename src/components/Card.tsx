import React from 'react';
import { Box } from './Theme';

export type CardProps = React.PropsWithChildren<{

}>;

export function Card({ children }: CardProps) {
    return (
        <Box
            padding="m"
            elevation={24}
            shadowColor="grey-400"
            shadowOffset={{ width: -2, height: 4 }}
            shadowOpacity={0.2}
            shadowRadius={3}
            backgroundColor="white"
            borderRadius="s"
        >
            {children}
        </Box>
    );
}

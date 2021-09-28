import React from 'react';
import { ViewProps } from 'react-native';

export type PaperProps = ViewProps & {
    children?: React.ReactNode;
    variant?: 'outlined' | 'default';
    disableElevation?: boolean;
    roundedCorners?: boolean;
};

export const PaperContext = React.createContext<PaperProps | null>(null);

export const usePaperContext = () => React.useContext(PaperContext);

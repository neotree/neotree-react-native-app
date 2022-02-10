import React from 'react';
import { Theme, defaultTheme } from './theme';
import { mergeDeep } from '../utils/mergeDeep';

export * from './theme';

const Context = React.createContext<Theme>(defaultTheme);

export const useTheme = () => React.useContext(Context);

export function createTheme(theme: Partial<Theme>): Theme {
    return mergeDeep(
        { ...defaultTheme, },
        { ...theme, },
    ) as Theme;
}

export type ThemeProviderProps = {
    theme: Theme;
    children?: React.ReactNode;
};

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    return (
        <Context.Provider value={theme}>
            {children}
        </Context.Provider>
    );
}

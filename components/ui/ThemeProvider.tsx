import React from 'react';
import { ThemeContext, Theme, defaultThemeContext } from './theme';

export type ThemeProviderProps = {
    children: React.ReactNode;
    theme: Theme;
};

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
    return (
        <ThemeContext.Provider
            value={{
                ...defaultThemeContext,
                customTheme: { ...theme },
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

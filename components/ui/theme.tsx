import React from 'react';

export type Theme = {
    typography?: {
        button?: {
            fontWeight?: "bold" | "normal" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
            textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
        };
        caption?: {
            fontSize?: number;
        };
        h1?: {
            fontSize?: number;
        };
        h2?: {
            fontSize?: number;
        };
        h3?: {
            fontSize?: number;
        };
    };
    spacing?: (spacing?: number) => number;
    palette?: {
        divider?: string;
        primary?: {
            main?: string;
            contrastText?: string;
        },
        secondary?: {
            main?: string;
            contrastText?: string;
        },
        error?: {
            main?: string;
            contrastText?: string;
        },
        success?: {
            main?: string;
            contrastText?: string;
        },
        text?: {
            primary?: string;
            secondary?: string;
            disabled?: string;
            hint?: string;
        },
        background?: {
            paper?: string;
            default?: string;
        },
        action?: {
            active?: string;
            hover?: string;
            selected?: string;
            disabled?: string;
            disabledBackground?: string;
        }
    }
}

export const defaultTheme: Theme & { overrides: Theme } = {
    overrides: {},
    typography: {
        button: {
            fontWeight: '900',
            textTransform: 'uppercase',
        },
        caption: {
            fontSize: 10,
        },
        h1: {
            fontSize: 40,
        },
        h2: {
            fontSize: 30,
        },
        h3: {
            fontSize: 25,
        },
    },
    spacing: (spacing = 1) => spacing * 8,
    palette: {
        divider: 'rgba(0,0,0,.12)',
        primary: {
            main: '#70a487', // '#2980b9',
            contrastText: '#fff',
        },
        secondary: {
            main: '#2b304a', // '#f39c12',
            contrastText: '#fff',
        },
        error: {
            main: '#c0392b',
            contrastText: '#fff',
        },
        success: {
            main: '#16a085',
            contrastText: '#fff',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.54)',
            disabled: 'rgba(0, 0, 0, 0.38)',
            hint: 'rgba(0, 0, 0, 0.38)',
        },
        background: {
            paper: '#fff',
            default: '#fafafa'
        },
        action: {
            active: 'rgba(0, 0, 0, 0.54)',
            hover: 'rgba(0, 0, 0, 0.08)',
            selected: 'rgba(0, 0, 0, 0.14)',
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)'
        }
    }
}

export const ThemeContext = React.createContext(defaultTheme);

export const useTheme = (): Theme => {
    const { overrides, ...theme } = React.useContext(ThemeContext);
    return { ...theme, ...overrides };
};

export type ThemeProviderProps = {
    children: React.ReactNode;
    theme?: Theme;
};

export function ThemeProvider({ children, theme, }: ThemeProviderProps) {
    return (
        <ThemeContext.Provider
            value={{
                ...defaultTheme,
                overrides: { ...theme }
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

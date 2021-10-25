import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { mergeDeep } from './utils';

export interface ThemePalette {
    mode?: 'light' | 'dark';

    divider?: string;

    text?: {
        primary: string;
        secondary: string;
        disabled: string;
    };

    primary?: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };

    secondary?: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };

    error?: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };

    warning?: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };

    success?: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };

    info?: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };

    background?: {
        default?: string;
        paper?: string;
    };

    action?: {
        active?: string;
        hover?: string;
        hoverOpacity?: number;
        selected?: string;
        disabled?: string;
        disabledBackground?: string;
        selectedOpacity?: number;
        disabledOpacity?: number;
        focus?: string;
        focusOpacity?: number;
        activatedOpacity?: number;
    };

    grey?: {
        50?: string,
        100?: string,
        200?: string,
        300?: string,
        400?: string,
        500?: string,
        600?: string,
        700?: string,
        800?: string,
        900?: string,
        A100?: string,
        A200?: string,
        A400?: string,
        A700?: string
    },
}

export interface ThemeTypography {
    fontFamily?: string;
    fontSize?: number;
    fontWeightLight?: number;
    fontWeightRegular?: number;
    fontWeightMedium?: number;
    fontWeightBold?: number;
    h1?: StyleProp<TextStyle>;
    h2?: StyleProp<TextStyle>;
    h3?: StyleProp<TextStyle>;
    h4?: StyleProp<TextStyle>;
    h5?: StyleProp<TextStyle>;
    h6?: StyleProp<TextStyle>;
    subtitle1?: StyleProp<TextStyle>;
    subtitle2?: StyleProp<TextStyle>;
    body1?: StyleProp<TextStyle>;
    body2?: StyleProp<TextStyle>;
    button?: StyleProp<TextStyle>;
    caption?: StyleProp<TextStyle>;
    overline?: StyleProp<TextStyle>;
}

export interface Theme {
    layout?: {
        contentWidth?: number | string;
        maxContentWidth?: number | string;
    };
    spacing?: (spacing?: number) => number;
    borderRadius?: number,
    palette?: ThemePalette;
    typography?: ThemeTypography;
}

export type ThemeContextValue = Theme & {
    theme?: Theme,
    overrides?: Theme;
    customTheme?: Theme;
};

export const defaultTheme: Theme = {
    layout: {
        contentWidth: '90%',
        maxContentWidth: 800, 
    },

    borderRadius: 5,

    spacing: (spacing: number = 1) => spacing * 10,
    
    palette: {
        mode: 'light',

        divider: 'rgba(0, 0, 0, 0.12)',

        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },

        primary: {
            main: '#70a487', // '#2980b9',
            dark: '#70a487',
            light: '#70a487',
            contrastText: '#ffffff',
        },

        secondary: {
            main: '#2b304a', // '#f39c12',
            dark: '#2b304a',
            light: '#2b304a',
            contrastText: '#ffffff',
        },

        error: {
            main: '#d32f2f',
            dark: '#ef5350',
            light: 'c62828',
            contrastText: '#fff',
        },
    
        warning: {
            main: '#ED6C02',
            dark: '#ff9800',
            light: '#e65100',
            contrastText: '#fff',
        },
    
        success: {
            main: '#2e7d32',
            dark: '#4caf50',
            light: '#1b5e20',
            contrastText: '#fff',
        },
    
        info: {
            main: '#0288d1',
            dark: '#03a9f4',
            light: '#01579b',
            contrastText: '#fff',
        },

        background: {
            default: '#f1f1f1', // '#fff',
            paper: '#fff',
        },

        action: {
            active: 'rgba(0, 0, 0, 0.54)',
            hover: 'rgba(0, 0, 0, 0.08)',
            hoverOpacity: 0.08,
            selected: 'rgba(0, 0, 0, 0.14)',
            selectedOpacity: 0.08,
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
            disabledOpacity: 0.38,
            focus: 'rgba(0, 0, 0, 0.12)',
            focusOpacity: 0.12,
            activatedOpacity: 0.12,
        },

        grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
            A100: '#d5d5d5',
            A200: '#aaaaaa',
            A400: '#303030',
            A700: '#616161'
        }
    },
    typography: {
        // fontFamily: '',
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h1: {
            // fontFamily: '',
            // fontWeight: 300,
            fontSize: 96,
            // lineHeight: 1.167,
            letterSpacing: -0.24992,
        },
        h2: {
            // fontFamily: '',
            // fontWeight: 300,
            fontSize: 60,
            // lineHeight: 1.2,
            letterSpacing: -0.13328,
        },
        h3: {
            // fontFamily: '',
            // fontWeight: 400,
            fontSize: 48,
            // lineHeight: 1.167,
            letterSpacing: 0,
        },
        h4: {
            // fontFamily: '',
            // fontWeight: 400,
            fontSize: 34,
            // lineHeight: 1.235,
            letterSpacing: 0.1176,
        },
        h5: {
            // fontFamily: '',
            // fontWeight: 400,
            fontSize: 24,
            // lineHeight: 1.334,
            letterSpacing: 0,
        },
        h6: {
            // fontFamily: '';
            // fontWeight: 500,
            fontSize: 20,
            // lineHeight: 1.6,
            letterSpacing: 0.12,
        },
        subtitle1: {
            // fontFamily: '',
            // fontWeight: 400,
            fontSize: 16,
            // lineHeight: 1.75,
            letterSpacing: 0.15008,
        },
        subtitle2: {
            // fontFamily: '',
            // fontWeight: 500,
            fontSize: 14,
            // lineHeight: 1.57,
            letterSpacing: 0.11424,
        },
        body1: {
            // fontFamily: '',
            // fontWeight: 400,
            // fontSize: 16,
            // lineHeight: 1.5,
            letterSpacing: 0.15008,
        },
        body2: {
            // fontFamily: '',
            // fontWeight: 400,
            fontSize: 14,
            // lineHeight: 1.43,
            letterSpacing: 0.17136,
        },
        button: {
            // fontFamily: '',
            fontWeight: 'bold',
            // fontSize: 14,
            // lineHeight: 1.75,
            letterSpacing: 0.45712,
            textTransform: 'uppercase',
        },
        caption: {
            // fontFamily: '',
            // fontWeight: 400,
            fontSize: 12,
            // lineHeight: 1.66,
            letterSpacing: 0.53328,
        },
        overline: {
            // fontFamily: '',
            // fontWeight: 400,
            fontSize: 12,
            // lineHeight: 2.66,
            letterSpacing: 1.33328,
            textTransform: 'uppercase',
        },
    },
};

const defaultDarkTheme: Theme = {
    palette: {
        mode: 'dark',
        
        divider: 'rgba(255, 255, 255, 0.12)',

        text: {
            primary: '#fff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },

        background: {
            default: '#2d3436',
            paper: '#2d3436',
        },

        action: {
            active: '#fff',
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.16)',
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
        },
    },
};

interface IThemeContext {
    defaultTheme: Theme;
    defaultDarkTheme: Theme;
    customTheme: Theme;
};

export const defaultThemeContext: IThemeContext = {
    defaultTheme,
    defaultDarkTheme,
    customTheme: {},
};

export const ThemeContext = React.createContext<IThemeContext>(defaultThemeContext);

const getThemeFromContext = (ctx: IThemeContext) => {
    const { defaultTheme, defaultDarkTheme, customTheme, } = { ...ctx };
    const mode = customTheme?.palette?.mode || defaultTheme?.palette?.mode;
    const theme = mergeDeep(
        Object.assign({}, { ...defaultTheme }),
        Object.assign({}, { ...(mode === 'dark' ? defaultDarkTheme : {}) }),
        Object.assign({}, { ...customTheme }),
    );
    return { ...theme };
};

export const useTheme = (): Theme => {
    const ctx = React.useContext(ThemeContext);
    return getThemeFromContext({ ...ctx });
};

export const createTheme = (theme: Theme): Theme => getThemeFromContext({
    ...({ ...defaultThemeContext }),
    customTheme: { ...theme },
});

import React from 'react';
import { ViewStyle, TextStyle, ImageStyle } from "react-native";
import { 
    createTheme,
    createBox,
    createText,
    useTheme as useReTheme,
    ThemeProvider as RestyleThemeProvider  
} from '@shopify/restyle';

export const theme = createTheme({
    colors: {
        primary: 'rgba(112,164,135,255)',
        secondary: 'rgba(43,48,74,255)',
        primaryContrastText: 'white',
        secondaryContrastText: 'rgba(242,237,213,255)',
        textPrimary: 'rgba(0, 0, 0, 0.87)',
        textSecondary: 'rgba(0, 0, 0, 0.6)',
        textDisabled: 'rgba(0, 0, 0, 0.38)',
        error: '#d32f2f',
        errorContrastText: '#fff',
        warning: '#ed6c02',
        warningContrastText: '#fff',
        success: '#2e7d32',
        successContrastText: '#fff',
        info: '#0288d1',
        infoContrastText: '#fff',
        active: 'rgba(112,164,135,0.54)',
        disabledBackground: 'rgba(12, 13, 52, 0.05)',
        'grey-50': '#fafafa',
        'grey-100': '#f5f5f5',
        'grey-200': '#eeeeee',
        'grey-300': '#e0e0e0',
        'grey-400': '#bdbdbd',
        'grey-500': '#9e9e9e',
        'grey-600': '#757575',
        'grey-700': '#616161',
        'grey-800': '#424242',
        'grey-900': '#212121',
        'bg.dark': '#000000', //'#231f20',
		'bg.dark.contrast': '#fff',
		'bg.light': '#fff',
		'bg.active': 'rgba(112,164,135,.12)',
        white: '#fff',
        black: '#000',
        divider: 'rgba(0, 0, 0, 0.12)',
        highlight: 'rgba(255, 255, 0,.2)',
    },

    spacing: {
        s: 6,
        m: 10,
        l: 16,
        xl: 20,
        none: 0,
    },

    borderRadii: {
        s: 4,
        m: 10,
        l: 25,
        xl: 75,
        none: 0,
    },

    breakpoints: {
        phone: 0,
        tablet: 768,
    },

    textVariants: {
        title1: {
            fontSize: 28,
            color: 'textPrimary',
        },
        title2: {
            fontSize: 24,
            color: 'textPrimary',
        },
        title3: {
            fontSize: 20,
            color: 'textPrimary',
        },
        body: {
            fontSize: 16,
            color: 'textPrimary',
        },
        caption: {
            fontSize: 12,
        },
        button: {
            fontSize: 15,
        },
    },
});

export type Theme = typeof theme;

export type ThemeProviderProps = React.PropsWithChildren<{}>;

export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <RestyleThemeProvider
            theme={theme}
        >
            {children}
        </RestyleThemeProvider>
    );
}

export const Box = createBox<Theme>();

export const Text = createText<Theme>();
Text.defaultProps = {
    color: 'textPrimary',
    variant: 'body',
};

export const useTheme = () => useReTheme<Theme>();

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const makeStyles = <T extends NamedStyles<T>>(
  styles: (theme: Theme) => T
) => () => {
  const currentTheme = useTheme();
  return styles(currentTheme);
};

export default theme;

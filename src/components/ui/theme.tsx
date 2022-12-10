import React from "react";

export const theme = {
	palette: {
		primary: {
			main: '#ed1c24',
			contrastText: '#fff',
		},
		text: {
			disabled: '#999',
			primary: '#1e1e1e',
		},
		disabled: '#ddd',
	},
	colors: {
		primary: '#ed1c24',
		'primary.contrast': '#fff',
		secondary: '#006fb6',
		'secondary.contrast': '#fff',
		'text.primary': '#1e1e1e',
		'text.secondary': '#777',
		'text.disabled': '#999',
		disabled: '#ddd',
		'bg.dark': '#000000', //'#231f20',
		'bg.dark.contrast': '#fff',
		'bg.light': '#fff',
		'bg.active': 'rgba(237, 28, 36, .12)',
		divider: 'rgba(0, 0, 0, .12)',
		error: '#b20008',
	},
	spacing: {
		xs: 2,
		sm: 6,
		md: 10,
		lg: 12,
		xl: 15,
	},
	breakpoints: {
		phone: 0,
		tablet: 768,
	},
	textSize: {
		xs: 12,
		sm: 16,
		md: 20,
		lg: 24,
		xl: 30,
	},
	fontType: {
		normal: 'PT-Sans-Regular',		
		italic: 'PT-Sans-Italic',
		bold: 'PT-Sans-Bold',
		'bold-italic': 'PT-Sans-Bold-Italic',
	},
	rounded: {
		none: 0,
		xs: 2,
		sm: 4,
		md: 8,
		lg: 12,
	},
};

export type Theme = typeof theme;

const ThemeContext = React.createContext<Theme>(theme);

export const useTheme = () => React.useContext(ThemeContext);

export type ThemeProviderProps = React.PropsWithChildren<{

}>;

export function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<ThemeContext.Provider
			value={theme}
		>
			{children}
		</ThemeContext.Provider>
	);
}

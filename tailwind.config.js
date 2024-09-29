/** @type {import('tailwindcss').Config} */

/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                border: '#e2e8f0',
                background: {
                    DEFAULT: '#fff',
                    foreground: '#161622',
                },
                danger: {
                    DEFAULT: '#ff7675',
                    foreground: '#fff',
                },
                success: {
                    DEFAULT: '#55efc4',
                    foreground: '#fff',
                },
                primary: {
                    100: '#f0f5f3',
                    200: '#e2ece7',
                    300: '#d4e3db',
                    400: '#c5dacf',
                    500: '#b7d1c3',
                    600: '#a9c8b7',
                    700: '#9abfab',
                    800: '#8cb69f',
                    900: '#7ead93',
                    DEFAULT: '#70a487',
                    foreground: '#fff',
                },
                secondary: {
                    100: '#e9eaec',
                    200: '#d4d5da',
                    300: '#bfc0c8',
                    400: '#aaacb6',
                    500: '#9597a4',
                    600: '#7f8292',
                    700: '#6a6e80',
                    800: '#55596e',
                    900: '#40445c',
                    DEFAULT: "#2b304a",
                    foreground: '#fff',
                },
                
                black: {
                    DEFAULT: "#000",
                },
                gray: {
                    100: "#CDCDE0",
                },
            },
            fontFamily: {
                normal: ["Roboto-Regular", "sans-serif"],
                italic: ["Roboto-Italic", "sans-serif"],
                thin: ["Roboto-Thin", "sans-serif"],
                light: ["Roboto-Light", "sans-serif"],
                'semi-bold': ["Roboto-Medium", "sans-serif"],
                bold: ["Roboto-Bold", "sans-serif"],
                'extra-bold': ["Roboto-Black", "sans-serif"],
                'thin-italic': ["Roboto-ThinItalic", "sans-serif"],
                'light-italic': ["Roboto-LightItalic", "sans-serif"],
                'semi-bold-italic': ["Roboto-MediumItalic", "sans-serif"],
                'bold-italic': ["Roboto-BoldItalic", "sans-serif"],
                'extra-bold-italic': ["Roboto-BlackItalic", "sans-serif"],
            },
        },
    },
    plugins: [],
};


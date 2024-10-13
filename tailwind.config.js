/** @type {import('tailwindcss').Config} */

/** @type {import('tailwindcss').Config} */

const theme = require('./tailwind.extend.js');

module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: theme.colors,
            fontFamily: theme.fontFamily,
        },
    },
    plugins: [],
};


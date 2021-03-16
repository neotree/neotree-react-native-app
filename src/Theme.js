import React from 'react';

const theme = {
  palette: {
    disabled: '#ccc',

    primary: {
      main: '#039BE5',
      contastText: '#fff',
    },

    error: {
      main: '#b20008',
      contastText: '#fff',
    }
  }
};

const ThemeContext = React.createContext(theme);

export const useTheme = () => React.useContext(ThemeContext);

export function provideTheme(Component) {
  return function ThemeProvider(props) {
    return (
      <ThemeContext.Provider value={theme}>
        <Component {...props} />
      </ThemeContext.Provider>
    );
  };
}

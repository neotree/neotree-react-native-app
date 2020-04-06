export default {
  spacing: (val = 1) => {
    val = val < 1 ? 1 : val;
    const spacing = 8;
    return spacing + (spacing * (val - 1));
  },
  
  palette: {
    primary: {
      main: '#22a6b3',
      text: '#fff',
    },
    secondary: {
      main: '#f0932b',
      text: '#fff',
    },
    error: {
      main: '#eb4d4b',
      text: '#fff',
    },
    success: {
      main: '#27ae60',
      text: '#fff'
    },
    text: {
      primary: '#000',
      secondary: '#999',
      disabled: '#999'
    }
  }
};

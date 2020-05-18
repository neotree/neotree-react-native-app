import hexToRGB from './hexToRGB';

const palette = {
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
  },
  disabled: '#ccc',
};

export default {
  palette,

  spacing: (val = 1) => {
    val = val < 1 ? 1 : val;
    const spacing = 8;
    return spacing + (spacing * (val - 1));
  },

  transparentize: (hex, value = 1) => {
    const { r, g, b } = hexToRGB(hex) || {};
    return `rgba(${[r || '', g || '', b || ''].join(',')},${value})`;
  },

  fontSize: {
    default: 18,
    sm: 12,
    lg: 25,
    xl: 30,
    h1: 35,
    h2: 30,
    h3: 25,
    h4: 20,
    caption: 12,
  },
};

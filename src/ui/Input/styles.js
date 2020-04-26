import hexToRGB from '../styles/hexToRGB';

export default (theme) => {
  const transparentize = hex => {
    const { r, g, b } = hexToRGB(hex) || {};
    return `rgba(${[r || '', g || '', b || ''].join(',')},.08)`;
  };

  return {
    root: {
      padding: theme.spacing(),
      fontSize: theme.fontSize.default,
      backgroundColor: 'rgba(0,0,0,.08)',
    },
    noFill: {
      backgroundColor: 'transparent',
    },
    primary: {
      backgroundColor: transparentize(theme.palette.primary.main),
    },
    secondary: {

    },
    error: {

    },
    sm: {
      fontSize: theme.fontSize.sm,
    },
    lg: {
      fontSize: theme.fontSize.lg,
    },
    xl: {
      fontSize: theme.fontSize.xl,
    }
  };
};

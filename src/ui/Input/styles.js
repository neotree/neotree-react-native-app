import hexToRGB from '../styles/hexToRGB';

export default (theme, { variant, color, size }) => {
  const transparentize = hex => {
    const { r, g, b } = hexToRGB(hex) || {};
    return `rgba(${[r || '', g || '', b || ''].join(',')},.08)`;
  };

  const defaultBgColor = 'rgba(0,0,0,.08)';

  let backgroundColor = 'transparent';
  if (variant === 'contained') {
    backgroundColor = theme.palette[color] ? transparentize(theme.palette[color].main) : defaultBgColor;
  }

  return {
    root: {
      padding: theme.spacing(),
      fontSize: theme.fontSize.default,
      backgroundColor,
      borderWidth: 1,
      borderColor: variant !== 'outlined' ? 'transparent' : '#ccc',
      ...!size ? null : { fontSize: theme.fontSize[size] },
    },
    label: {
      marginBottom: 5
    },
  };
};

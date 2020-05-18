export default (theme, { variant, color, size, editable }) => {
  const defaultBgColor = 'rgba(0,0,0,.08)';

  let backgroundColor = 'transparent';
  if (variant === 'contained') {
    backgroundColor = theme.palette[color] ? theme.transparentize(theme.palette[color].main, 0.08) : defaultBgColor;
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
      marginBottom: 5,
      ...editable ? null : { color: theme.palette.disabled },
    },
  };
};

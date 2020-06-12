export default (theme, { variant, color, size, editable }) => {
  const defaultBgColor = 'rgba(0,0,0,.08)';

  let backgroundColor = 'transparent';
  if (variant === 'contained') {
    backgroundColor = theme.palette[color] ? theme.transparentize(theme.palette[color].main, 0.08) : defaultBgColor;
  }

  return {
    root: {
      height: 60,
      borderRadius: 10,
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
    input: {
      backgroundColor: 'red',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      paddingHorizontal: theme.spacing(2),
      paddingVertical: theme.spacing(2),
      fontSize: theme.fontSize[size || 'default'],
    },
  };
};

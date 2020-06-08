export default (theme, props) => {
  const color = theme.palette[props.color] ?
    theme.palette[props.color].main || theme.palette[props.color]
    :
    props.color;

  const textColor = theme.palette[props.color] ?
    theme.palette[props.color].text || theme.palette[props.color]
    :
    props.color;

  return {
    root: {
      padding: theme.spacing(),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      backgroundColor: (() => {
        if (props.variant && props.disabled) return theme.palette.disabled;
        if (color && props.variant === 'contained') return color;
        return 'transparent';
      })(),

      ...props.variant === 'outlined' ? {
        borderWidth: 1,
        borderColor: (() => {
          if (props.disabled) return theme.palette.disabled;
          if (!color) return 'transparent';
          return color;
        })(),
      } : null,

      ...props.variant === 'contained' ? {
        shadowOffset: {
          width: props.shadow.shadowOffsetWidth,
          height: -props.shadow.shadowOffsetHeight
        },
        shadowOpacity: props.shadow.shadowOpacity,
        shadowRadius: props.shadow.shadowRadius,
      } : null,
    },
    text: {
      // fontWeight: 'bold',
      fontSize: theme.fontSize[props.size] || theme.fontSize.default,
      color: (() => {
        if (props.disabled) return theme.palette.text.disabled;
        if (!color) return theme.palette.text.primary;
        if (props.variant === 'contained') return textColor;
        return color;
      })()
    },
  };
};

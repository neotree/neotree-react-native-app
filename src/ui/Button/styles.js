export default (theme, props) => {
  return {
    root: {
      padding: theme.spacing(),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      backgroundColor: (() => {
        if (props.disabled) return theme.palette.disabled;
        if (props.color && props.variant === 'contained') return theme.palette[props.color].main;
        return 'transparent';
      })(),

      ...props.variant === 'outlined' ? {
        borderWidth: 1,
        borderColor: (() => {
          if (props.disabled) return theme.palette.disabled;
          if (!props.color) return 'transparent';
          return theme.palette[props.color].main;
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
        if (!props.color) return theme.palette.text.primary;
        if (props.variant === 'contained') return theme.palette[props.color].text;
        return theme.palette[props.color].main;
      })()
    },
  };
};

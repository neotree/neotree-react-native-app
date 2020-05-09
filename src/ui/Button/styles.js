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
      borderColor: (() => {
        if (props.disabled) return theme.palette.disabled;
        if (!props.color) return 'transparent';
        return theme.palette[props.color].main;
      })(),
      borderWidth: 1,
      ...props.variant !== 'contained' ? null : {
        shadowOffset: {
          width: props.shadow.shadowOffsetWidth,
          height: -props.shadow.shadowOffsetHeight
        },
        shadowOpacity: props.shadow.shadowOpacity,
        shadowRadius: props.shadow.shadowRadius,
      },
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

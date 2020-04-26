export default (theme) => {
  return {
    root: {
      fontSize: 18,
      color: theme.palette.text.primary,
    },
    h1: {
      fontSize: 35,
      fontWeight: 'bold'
    },
    h2: {
      fontSize: 30,
      fontWeight: 'bold'
    },
    h3: {
      fontSize: 25,
      fontWeight: 'bold'
    },
    h4: {
      fontSize: 20,
      fontWeight: 'bold'
    },
    caption: {
      fontSize: 12,
    },
    primary: {
      color: theme.palette.primary.main,
    },
    secondary: {
      color: theme.palette.secondary.main,
    },
    error: {
      color: theme.palette.error.main,
    },
    textPrimary: {
      color: theme.palette.text.primary,
    },
    textSecondary: {
      color: theme.palette.text.secondary,
    }
  };
};

import constants from '@/constants';

export default (theme) => {
  return {
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.primary.main,
    },

    text: {
      color: theme.palette.primary.text,
    },

    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: constants.SPLASH_LOGO_HEIGHT,
      width: constants.SPLASH_LOGO_WIDTH,
      margin: theme.spacing()
    }
  };
};

import tailwindThemeConfig from '../tailwind.extend';

const config = { ...tailwindThemeConfig, };

const theme = {
    primaryColor: config.colors.primary.DEFAULT,
    primaryContrastColor: config.colors.primary.foreground,
    secondaryColor: config.colors.secondary.DEFAULT,
    secondaryContrastColor: config.colors.secondary.foreground,
    dangerColor: config.colors.danger.DEFAULT,
    dangerContrastColor: config.colors.danger.foreground,
    successColor: config.colors.success.DEFAULT,
    successContrastColor: config.colors.success.foreground,
    backgroundColor: config.colors.background.DEFAULT,
    backgroundContrastColor: config.colors.background.foreground,
    border: config.colors.border,
};

export default theme;
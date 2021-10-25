import { Theme } from '..';

export const ColorsMap = {
    primary: 'primary',
    secondary: 'secondary',
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'success',
    primaryContrastText: 'primaryContrastText',
    secondaryContrastText: 'secondaryContrastText',
    infoContrastText: 'infoContrastText',
    warningContrastText: 'warningContrastText',
    errorContrastText: 'errorContrastText',
    successContrastText: 'successContrastText',
    disabled: 'disabled',
    textDisabled: 'textDisabled',
    textSecondary: 'textSecondary',
    textPrimary: 'textPrimary',
    disabledBackground: 'disabledBackground',
};

type GetColorOptions = {
    text?: boolean;
};

export const getColor = (theme: Theme, colorKey = '', options: GetColorOptions = {}) => {
    if (options.text) {
        switch (colorKey) {
            case 'disabled':
                colorKey = ColorsMap.textDisabled;
                break;
            default:
                /* DO NOTHING */
        }
    }
    let color = theme.palette[colorKey]?.main || theme.palette[colorKey.replace('ContrastText', '')]?.contrastText || '';
    switch (colorKey) {
        case ColorsMap.textPrimary:
            return theme.palette.text.primary;
        case ColorsMap.textSecondary:
            return theme.palette.text.secondary;
        case ColorsMap.textDisabled:
            return theme.palette.text.disabled;
        case ColorsMap.disabledBackground:
            return theme.palette.action.disabledBackground;
        case ColorsMap.disabled:
            return theme.palette.action.disabled;
        default: 
            return color;
    }
};

export const getTextColor = (theme: Theme, colorKey: string) => getColor(theme, colorKey, {
    text: true,
});

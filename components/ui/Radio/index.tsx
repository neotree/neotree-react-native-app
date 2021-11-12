import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View } from '../View';
import { RadioProps } from './types';
import { useTheme } from '../theme';
import { RadioContext } from './Context';
import * as constants from './constants';
import { MaterialIcons } from '@expo/vector-icons';

export * from '../types';

export const Radio = React.forwardRef((props: RadioProps, ref) => {
    const {
        children,
        size: sizeProp,
        color: colorProp,
        checked,
        disabled,
        onChange,
        variant,
    } = props;
    const size: RadioProps['size'] = sizeProp || 'default';
    const color: RadioProps['color'] = disabled ? 'disabled' : (colorProp || 'primary');

    const RadioRef = React.useRef(null);
    React.useImperativeHandle(ref, () => RadioRef.current);

    const theme = useTheme();
    const calculatedColor = (() => {
        if (color === 'disabled') {
            return {
                main: theme.palette.action.disabledBackground,
                backgroundColor: theme.palette.action.disabledBackground,
                contrastText: theme.palette.action.disabled,
            };
        };
        if (checked) {
            return {
                main: theme.palette[color].main,
                backgroundColor: theme.palette[color].main,
                contrastText: theme.palette[color].contrastText,
            };
        }
        return {
            main: theme.palette.divider,
            backgroundColor: 'transparent',
            contrastText: 'transparent',
        };
    })();

    return (
        <RadioContext.Provider
            value={{
                props: {
                    ...props,
                    color,
                    size,
                }
            }}
        >
            <TouchableOpacity
                disabled={disabled}
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                    },
                    variant !== 'outlined' ? {} : {
                        padding: theme.spacing(),
                        borderWidth: 1,
                        borderColor: calculatedColor.main,
                        borderRadius: 4,
                    },
                ]}
                onPress={() => onChange && onChange({ checked: checked ? true : !checked })}
            >
                <>
                    <View
                        style={[
                            {
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: constants[`${size}Size`],
                                height: constants[`${size}Size`],
                                borderWidth: 2,
                                borderColor: calculatedColor.main,
                                borderRadius: constants[`${size}Size`] / 2,
                                backgroundColor: calculatedColor.backgroundColor,
                            },
                        ]}
                    >
                        {!!checked && (
                            <MaterialIcons 
                                name={color === 'disabled' ? 'circle' : 'radio-button-unchecked'}
                                size={constants[`${size}IconSize`]}
                                color={calculatedColor.contrastText}
                            />
                        )}
                    </View>

                    {!!children && (
                        <View 
                            ml={theme.spacing()}
                            // style={[
                            //     {
                            //         flex: 1,
                            //     }
                            // ]}
                        >
                            {children}
                        </View>
                    )}
                </>
            </TouchableOpacity>
        </RadioContext.Provider>
    );
})

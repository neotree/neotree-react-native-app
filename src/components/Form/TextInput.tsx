import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  Platform,
} from 'react-native';
import { Box, useTheme, Text } from '../Theme';
import { Br } from '../Br';

export type TextInputProps = RNTextInputProps & {
  size?: 's' | 'm' | 'l';
  errors?: string[];
  label?: React.ReactNode;
  enableAssistance?: boolean;
};

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  (
    {
      size = 'm',
      style,
      errors,
      label,
      enableAssistance = false,
      autoCorrect,
      autoCapitalize,
      autoComplete,
      textContentType,
      importantForAutofill,
      spellCheck,
      keyboardType,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const assistanceProps: Partial<RNTextInputProps> = enableAssistance
      ? {}
      : {
          autoCorrect: false,
          autoCapitalize: 'none',
          autoComplete: 'off',
          spellCheck: false,
          ...(Platform.OS === 'ios' ? { textContentType: 'none' } : {}),
          ...(Platform.OS === 'android'
            ? {
                importantForAutofill: 'no',
                keyboardType: keyboardType ?? (textContentType !== 'password' ? 'visible-password' : 'default'),
              }
            : {}),
        };

    return (
      <>
        {!!label && (
          <>
            {typeof label !== 'string' ? label : <Text>{label}</Text>}
            <Br spacing="s" />
          </>
        )}

        <Box
          borderWidth={1}
          borderColor={errors?.length ? 'error' : 'divider'}
          borderRadius="m"
          backgroundColor={props.editable === false ? 'disabledBackground' : undefined}
        >
          <RNTextInput
            ref={ref}
            {...assistanceProps}
            {...props}
            autoCorrect={autoCorrect ?? assistanceProps.autoCorrect}
            autoCapitalize={autoCapitalize ?? assistanceProps.autoCapitalize}
            autoComplete={autoComplete ?? assistanceProps.autoComplete}
            textContentType={textContentType ?? assistanceProps.textContentType}
            importantForAutofill={
              importantForAutofill ?? assistanceProps.importantForAutofill
            }
            spellCheck={spellCheck ?? assistanceProps.spellCheck}
            keyboardType={keyboardType ?? assistanceProps.keyboardType}
            style={[
              {
                padding: theme.spacing[size],
                fontSize: (() => {
                  switch (size) {
                    case 'l':
                      return theme.textVariants.title2.fontSize;
                    case 's':
                      return theme.textVariants.caption.fontSize;
                    default:
                      return theme.textVariants.body.fontSize;
                  }
                })(),
              },
              style,
            ]}
          />
        </Box>

        {(errors || []).map((e, i) => (
          <Text variant="caption" color="error" key={`${e}${i}`}>
            {e}
          </Text>
        ))}
      </>
    );
  }
);
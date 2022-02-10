import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../theme';

export type TextProps = RNTextProps & {

};

export function Text(props: TextProps) {
    const theme = useTheme();
    
    return (
        <>
            <RNText {...props} />
        </>
    );
}

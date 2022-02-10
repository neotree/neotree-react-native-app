import React from 'react';
import { View as RNView, ViewProps as RNViewProps } from 'react-native';
import { useTheme } from '../theme';

export type DividerProps = RNViewProps & {

};

export function Divider(props: DividerProps) {
    const theme = useTheme();
    
    return (
        <>
            <RNView {...props} />
        </>
    );
}

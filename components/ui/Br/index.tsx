import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme';

export type BrProps = ViewProps & {
    spacing?: number
};

export const Br = React.forwardRef(({ spacing, style, ...props }: BrProps, ref) => {
    const brRef = React.useRef(null);
    React.useImperativeHandle(ref, () => brRef.current);
    const theme = useTheme();

    return (
        <View 
            ref={brRef}
            style={[
                { marginBottom: theme.spacing(spacing) },
                /* @ts-ignore */
                style && style.map ? style : [style],
            ]}
            {...props}
        /> 
    );
});

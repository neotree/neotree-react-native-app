import React from 'react';
import { View as RNView } from 'react-native';
import { useTheme } from '../theme';
import { ViewProps } from './types';

export function View({
    ml,
    mr,
    mt,
    mb,
    mv,
    mh,
    pl,
    pr,
    pt,
    pb,
    pv,
    ph,
    style,
    ...props
}: ViewProps) {
    const theme = useTheme();

    return (
        <>
            <RNView 
                {...props} 
                style={[
                    ml ? { marginLeft: ml, } : {},
                    mr ? { marginRight: mr, } : {},
                    mt ? { marginTop: mt, } : {},
                    mb ? { marginBottom: mb, } : {},
                    mv ? { marginVertical: mv, } : {},
                    mh ? { marginHorizontal: mh, } : {},
                    pl ? { paddingLeft: pl, } : {},
                    pr ? { paddingRight: pr, } : {},
                    pt ? { paddingTop: pt, } : {},
                    pb ? { paddingBottom: pb, } : {},
                    pv ? { paddingVertical: pv, } : {},
                    ph ? { paddingHorizontal: ph, } : {},
                    style,
                ]}
            />
        </>
    );
}

import React from 'react';
import { View as RNView,  ViewProps as RNViewProps } from 'react-native';
import { useTheme } from '../theme';

export type ViewProps = RNViewProps & {
    children?: React.ReactNode;
    variant?: 'outlined' | 'elevated';
    pl?: string | number;
    pr?: string | number;
    pt?: string | number;
    pb?: string | number;
    pv?: string | number;
    ph?: string | number;
    ml?: string | number;
    mr?: string | number;
    mt?: string | number;
    mb?: string | number;
    mv?: string | number;
    mh?: string | number;
};

export const View = React.forwardRef(({
    variant,
    pl,
    pr,
    pt,
    pb,
    pv,
    ph,
    ml,
    mr,
    mt,
    mb,
    mv,
    mh,
    style,
    ...props
}: ViewProps, ref) => {
    const theme = useTheme();

    const ViewRef = React.useRef(null);
    React.useImperativeHandle(ref, () => ViewRef.current);

    return (
        <>
            <RNView
                {...props}
                ref={ViewRef}
                style={[
                    theme.typography[variant],
                    !variant ? {} : { 
                        backgroundColor: theme.palette.background.paper, 
                        borderRadius: theme.borderRadius,
                    },
                    variant !== 'outlined' ? {} : {
                        borderWidth: 1,
                        borderColor: theme.palette.divider,
                    },
                    variant !== 'elevated' ? {} : {
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 2.62,
                        elevation: 8,
                    },
                    {
                        paddingLeft: pl,
                        paddingRight: pr,
                        paddingTop: pt,
                        paddingBottom: pb,
                        paddingVertical: pv,
                        paddingHorizontal: ph,
                        marginLeft: ml,
                        marginRight: mr,
                        marginTop: mt,
                        marginBottom: mb,
                        marginVertical: mv,
                        marginHorizontal: mh,
                    },
                    style,
                ]}
            />
        </>
    );
});

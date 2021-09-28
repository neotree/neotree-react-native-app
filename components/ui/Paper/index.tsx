import React from 'react';
import { View, ViewProps, StyleProp, RecursiveArray } from 'react-native';
import { shadow } from '../constants';
import { useTheme } from '../theme';
import { PaperContext, PaperProps } from './Context';

export const Paper = React.forwardRef((props: PaperProps, ref) => {
    const paperRef = React.useRef(null);
    React.useImperativeHandle(ref, () => paperRef.current);

    const theme = useTheme();

    const { 
        style,
        disableElevation,
        variant,
        roundedCorners,
        ...restProps 
    } = props;

    return (
        <PaperContext.Provider value={props}>
            <View 
                {...restProps}
                ref={paperRef}
                style={[
                    { 
                        borderWidth: 1,
                        borderColor: 'transparent',
                        borderRadius: roundedCorners ? 5 : 0,
                        backgroundColor: theme.palette.background.paper,
                    },
                    variant === 'outlined' ? {
                        borderColor: theme.palette.divider,
                    } : {
                        ...(disableElevation ? {} : shadow),
                    },                    
                    /* @ts-ignore */
                    style && style.map ? style : [style],
                ]}
            />
        </PaperContext.Provider>
    );
});

Paper.defaultProps = {
    roundedCorners: true,
};

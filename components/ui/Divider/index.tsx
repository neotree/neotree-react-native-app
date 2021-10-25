import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme';

export type DividerProps = ViewProps & {

};

export const Divider = React.forwardRef(({ style, ...props }: ViewProps, ref) => {
    const  dividerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => dividerRef.current);

    const theme = useTheme();

    return (
        <>
            <View 
                {...props} 
                ref={dividerRef} 
                style={[
                    {
                        height: 1,
                        backgroundColor: theme.palette.divider,
                    },
                    style,
                ]}
            />
        </>
    );
});

import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { useTheme } from '../theme';

export type LoaderProps = ActivityIndicatorProps & {

}

export const Loader = React.forwardRef(({
    color,
    ...props
}: LoaderProps, ref) => {
    const theme = useTheme();

    const loaderRef = React.useRef(null);
    React.useImperativeHandle(ref, () => loaderRef.current);
    
    return (
        <ActivityIndicator
            {...props}
            ref={loaderRef}
            color={color || theme.palette.primary.main}
        />
    );
});

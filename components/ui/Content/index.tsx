import React from 'react';
import { View, ViewProps } from '../View';
import { useTheme } from '../theme';

export type ContentContainerProps = ViewProps & {
    fullWidth?: boolean;
};

export type ContentProps = ViewProps & {
    children: React.ReactNode | (() => React.ReactNode);
    containerProps?: ContentContainerProps;
};

export const Content = React.forwardRef(({
    containerProps,
    style,
    children,
    fullWidth,
    ...props
}: ContentProps, ref) => {
    const theme = useTheme();
    const containerRef = React.useRef(null);
    const contentRef = React.useRef(null);
    React.useImperativeHandle(ref, () => contentRef.current);

    return (
        <View
            {...containerProps}
            ref={containerRef}
            style={[
                {
                    width: '100%',
                    alignItems: 'center',
                },
                containerProps?.style
            ]}
        >
            <View
                    {...props}
                    ref={contentRef}
                    style={[
                        { 
                            padding: theme.spacing(),
                            width: fullWidth ? '100%' : theme.layout.contentWidth,
                            maxWidth: theme.layout.maxContentWidth, 
                        },
                        style
                    ]}
                >
                    {typeof children === 'function' ? children() : children}
                </View>
        </View>
    );
});

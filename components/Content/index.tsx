import React from 'react';
import { View, ViewProps } from 'react-native';

export type LayoutContentProps = ViewProps & {
    children: React.ReactNode;
};

export const LayoutContent = React.forwardRef(({ style, ...props }: LayoutContentProps, ref) => {
    const layoutRef = React.useRef(null);
    React.useImperativeHandle(ref, () => layoutRef.current);

    return (
        <View
            {...props}
            style={[
                {
                    width: '90%',
                    maxHeight: 800,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                },
                /* @ts-ignore */
                style && style.map ? style : [style],
            ]}
        />
    );
});

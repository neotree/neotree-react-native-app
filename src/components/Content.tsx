import React from 'react';
import { View, ViewProps } from 'react-native';

export type ContentProps = React.PropsWithChildren<ViewProps & {
    containerProps?: ViewProps;
}>;


export function Content({ style, containerProps, ...props }: ContentProps) {
    return (
        <View
            {...containerProps}
            style={[
                containerProps?.style,
                {
                    alignItems: 'center',
                },
            ]}
        >
            <View
                {...props}
                style={[                    
                    {
                        width: '90%',
                        maxWidth: 500,
                        padding: 10,
                    },
                    style,
                ]}
            />
        </View>
    );
}

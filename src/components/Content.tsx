import React from 'react';
import { View, ViewProps, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export type ContentProps = React.PropsWithChildren<ViewProps & {
    containerProps?: ViewProps;
}>;

export const CONTENT_STYLES = {
	width: width * 0.95,
	maxWidth: 500,
	padding: 10,
};

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
                    CONTENT_STYLES,
                    style,
                ]}
            />
        </View>
    );
}

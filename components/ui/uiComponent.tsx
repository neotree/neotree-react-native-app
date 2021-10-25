import React from 'react';
import { StyleProp } from 'react-native';
import { useTheme, Theme } from './theme';

type UiComponent = {
    style?: StyleProp<any> | ((theme: Theme) => StyleProp<any>);
};

export function uiComponent<T = any>(Component: React.ComponentPropsWithRef<any>) {
    const theme = useTheme();
    return React.forwardRef((props: UiComponent & T, ref) => {
        let style = {};
        if (props.style) {
            style = typeof props.style === 'function' ? props.style(theme) : style;
        }
        return (
            <Component 
                {...props} 
                ref={ref} 
                style={[
                    // @ts-ignore
                    ...(style?.map ? style : [style]),
                ]}
            />
        );
    });
}

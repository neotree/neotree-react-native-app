import { View, ViewProps } from "react-native";

import { Text, TextProps } from './text';

export type CardTitleProps = Omit<ViewProps, 'children'> & {
    children: TextProps['children'];
    textProps?: TextProps;
};

export function CardTitle({ children, textProps, ...props }: CardTitleProps) {
    return (
        <>
            <View
                {...props}
            >
                <Text
                    {...textProps}
                >{children}</Text>
            </View>
        </>
    );
}

export type CardProps = ViewProps & {

};

export function Card({ children, ...props }: CardProps) {
    return (
        <>
            <View
                {...props}
            >
                {children}
            </View>
        </>
    );
}

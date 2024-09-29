import { View, ViewProps } from "react-native";
import clsx from "clsx";

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
                    className={clsx(
                        'text-lg mb-1 font-semi-bold',
                        textProps?.className,
                    )}
                >{children}</Text>
            </View>
        </>
    );
}

export type CardContentProps = ViewProps & {

};

export function CardContent({ children, ...props }: CardContentProps) {
    return (
        <>
            <View
                {...props}
                className={clsx(
                    'p-3',
                    props.className,
                )}
            >
                {children}
            </View>
        </>
    );
}

export type CardFooterProps = ViewProps & {

};

export function CardFooter({ children, ...props }: CardFooterProps) {
    return (
        <>
            <View
                {...props}
                className={clsx(
                    'flex flex-row items-center justify-end',
                    props.className,
                )}
            >
                {children}
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
                className={clsx(
                    'border border-border bg-background rounded-lg',
                    props.className,
                )}
            >
                {children}
            </View>
        </>
    );
}

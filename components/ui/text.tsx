import clsx from "clsx";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

export type TextProps = RNTextProps & {
    
};

export function Text({ 
    children, 
    className,
    ...props 
}: TextProps) {
    return (
        <>
            <RNText
                {...props}
                className={clsx(
                    'font-normal text-base text-gray-950',
                    className,
                )}
            >
                {children}
            </RNText>
        </>
    );
}

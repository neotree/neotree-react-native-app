import { Text as RNText, TextProps as RNTextProps } from "react-native";

export type TextProps = RNTextProps & {

};

export function Text({ children, ...props }: TextProps) {
    return (
        <>
            <RNText
                {...props}
            >
                {children}
            </RNText>
        </>
    );
}

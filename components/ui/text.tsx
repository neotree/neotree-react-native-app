import clsx from "clsx";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

export type TextProps = RNTextProps & {
    variant?: 'label' | 'labelDisabled' | 'title';
};

export function Text({ 
    children, 
    className,
    variant,
    ...props 
}: TextProps) {
    return (
        <>
            <RNText
                {...props}
                className={clsx(
                    'font-normal text-base text-gray-900',
                    {
                        label: 'mb-1 text-xs font-bold',
                        labelDisabled: 'mb-1 text-xs font-bold opacity-50',
                        title: 'text-xl',
                    }[variant!],
                    className,
                )}
            >
                {children}
            </RNText>
        </>
    );
}

import clsx from "clsx";
import { View, ViewProps } from "react-native";

export type SeparatorProps = ViewProps;

export function Separator({ 
    children, 
    className,
    ...props 
}: SeparatorProps) {
    return (
        <>
            <View
                {...props}
                className={clsx(
                    'h-[1px] w-full bg-border',
                    className,
                )}
            />
        </>
    );
}

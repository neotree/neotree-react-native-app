import { View, ViewProps } from "react-native";
import clsx from "clsx";

type Props = ViewProps;

export function Content({ children, className, ...props }: ViewProps) {
    return (
        <View
            {...props}
            className={clsx(
                'w-[90%] max-w-lg mx-auto',
                className,
            )}
        >
            {children}
        </View>
    );
}

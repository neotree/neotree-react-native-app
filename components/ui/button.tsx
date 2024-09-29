import clsx from "clsx";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Text } from "./text";

export type ButtonProps = TouchableOpacityProps & {
    
};

export function Button({ 
    children, 
    className,
    ...props 
}: ButtonProps) {
    return (
        <>
            <TouchableOpacity
                {...props}
                className={clsx(
                    'bg-primary py-0.5 px-1 rounded-lg',
                    className,
                )}
            >
                {typeof children !== 'string' ? children : (
                    <Text
                        className={clsx(
                            'text-primary-foreground font-semi-bold',
                        )}
                    >
                        {children}
                    </Text>
                )}
            </TouchableOpacity>
        </>
    );
}

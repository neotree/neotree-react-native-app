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
                    'bg-primary py-2 px-2 rounded-lg flex-row justify-center',
                    props.disabled && 'opacity-50',
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

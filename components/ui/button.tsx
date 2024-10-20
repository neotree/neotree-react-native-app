import clsx from "clsx";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Text } from "./text";

export type ButtonProps = TouchableOpacityProps & {
    color?: 'default' | 'error';
    variant?: 'default' | 'ghost';
};

export function Button({ 
    children, 
    className,
    color = 'default',
    variant = 'default',
    ...props 
}: ButtonProps) {
    return (
        <>
            <TouchableOpacity
                {...props}
                className={clsx(
                    'py-2 px-4 rounded-lg flex-row justify-center',
                    props.disabled && 'opacity-50',
                    {
                        default: clsx(
                            {
                                default: clsx('bg-primary'),
                                ghost: clsx(''),
                            }[variant],
                        ),
                        error: clsx(
                            {
                                default: clsx('bg-danger'),
                                ghost: clsx(''),
                            }[variant],
                        ),
                    }[color],
                    className,
                )}
            >
                {typeof children !== 'string' ? children : (
                    <Text
                        className={clsx(
                            'font-semi-bold',
                            {
                                default: clsx(
                                    {
                                        default: clsx('text-primary-foreground'),
                                        ghost: clsx('text-primary'),
                                    }[variant],
                                ),
                                error: clsx(
                                    {
                                        default: clsx('text-danger-foreground'),
                                        ghost: clsx('text-danger'),
                                    }[variant],
                                ),
                            }[color],
                        )}
                    >
                        {children}
                    </Text>
                )}
            </TouchableOpacity>
        </>
    );
}

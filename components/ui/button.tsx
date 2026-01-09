import { createContext, forwardRef, useContext } from "react";
import { TouchableOpacity, type TouchableOpacityProps, View } from "react-native";

import { cn } from "@/lib/utils";

export type ButtonProps = TouchableOpacityProps & {
    as?: React.ComponentType<TouchableOpacityProps>;
    error?: boolean;
    color?: 'primary' | 'secondary' | 'danger';
    variant?: 'outline';
};

const ButtonContext = createContext<null | ButtonProps>(null);

export const useButtonContext = () => useContext(ButtonContext);

export const Button = forwardRef<View, ButtonProps>((props, ref) => {
    const {
        className,
        as,
        error,
        color,
        variant,
        ...btnProps
    } = props;

    const Component = (as || TouchableOpacity) as typeof TouchableOpacity;

    return (
        <ButtonContext.Provider value={props}>
            <Component
                {...btnProps}
                ref={ref}
                className={cn(
                    `items-center justify-center gap-x-2 px-3 py-2 border border-primary bg-primary rounded-lg  disabled:opacity-50`,
                    color === 'danger' && 'bg-destructive border-destructive',
                    color === 'secondary' && 'bg-secondary border-secondary',
                    variant === 'outline' && 'bg-background border-border',
					variant === 'outline' && color === 'primary' && 'bg-background border-primary',
                    variant === 'outline' && color === 'danger' && 'border-destructive',
                    variant === 'outline' && color === 'secondary' && 'border-secondary',
                    className,
                )}
            />
        </ButtonContext.Provider>
    );
});

Button.displayName = 'Button';

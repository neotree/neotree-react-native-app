import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/utils";

export type InputProps = TextInputProps & {
    as?: React.ComponentType<TextInputProps>;
    error?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>((
    {
        className,
        as,
        error,
        ...props
    },
    ref,
) => {
    const Component = (as || TextInput) as typeof TextInput;

    return (
        <Component
            {...props}
            ref={ref}
            className={cn(
                `px-3 py-2 border border-border rounded-lg bg-background ring-offset-background
                    focus:border-primary disabled:opacity-50`,
                !props.editable && 'opacity-50',
                error && 'border-destructive/50 focus:border-destructive',
                className,
            )}
        />
    );
});

Input.displayName = 'Input';

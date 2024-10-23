import { createRef, forwardRef, useState, RefAttributes } from "react";
import { TextInput, TextInputProps } from "react-native";
import clsx from "clsx";

export type InputProps = TextInputProps & {
    
};

export const Input = forwardRef<TextInput, InputProps>(({
    ...props
}, ref) => {
    const [focused, setFocused] = useState(false);

    return (
        <>
            <TextInput 
                {...props}
                ref={ref}
                className={clsx(
                    'w-full px-4 py-2 text-base font-normal rounded-md border-2 border-primary/20 bg-primary/10 text-gray-900',
                    focused && 'bg-transparent border-primary',
                    props.editable === false && 'opacity-40',
                )}
                onFocus={(...args) => {
                    setFocused(true);
                    props.onFocus?.(...args);
                }}
                onBlur={(...args) => {
                    setFocused(false);
                    props.onBlur?.(...args);
                }}
            />
        </>
    );
})
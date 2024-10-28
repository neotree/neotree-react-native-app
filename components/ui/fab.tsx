import { forwardRef } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import clsx from "clsx";

export const FAB = forwardRef<TouchableOpacity, TouchableOpacityProps>(({ className, style, ...props }, ref) => {
    return (
        <>
            <TouchableOpacity 
                {...props}
                ref={ref}
                style={[
                    {
                        elevation: 24,
                        shadowColor: 'rgba(0,0,0,.5)',
                        shadowOffset: { width: -2, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                    },
                    style,
                ]}
                className={clsx(
                    'bg-primary rounded-full p-2 w-12 h-12 items-center justify-center',
                    props.disabled && 'opacity-50',
                    className,
                )}
            />
        </>
    );
});

import React, { useState, useEffect, createContext, useContext, forwardRef } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

const CollapsibleContext = createContext<{
    isOpen: boolean;
    setIsOpen:  React.Dispatch<React.SetStateAction<boolean>>;
}>(null!);

type CollapsibleProps = {
    open?: boolean;
    children?: React.ReactNode | ((props: { isOpen: boolean; }) => React.ReactNode);
    onOpenChange?: (open: boolean) => void;
};

export function Collapsible({ children, open, onOpenChange, }: CollapsibleProps) {
    const [isOpen, setIsOpen] = useState(!!open);

    useEffect(() => { setIsOpen(!!open); }, [open]);

    useEffect(() => { onOpenChange?.(isOpen); }, [isOpen]);

    return (
        <CollapsibleContext.Provider
            value={{
                isOpen,
                setIsOpen,
            }}
        >
            {typeof children === 'function' ? children({ isOpen }) : children}
        </CollapsibleContext.Provider>
    );
}

export function CollapsibleContent({ children }: {
    children?: React.ReactNode;
}) {
    const { isOpen } = useContext(CollapsibleContext);
    if (!isOpen) return null;
    return (
        <>
            {children}
        </>
    );
}

type CollapsibleTriggerProps = {
    children: React.ReactElement<{
        onPress?: (...args: any[]) => void;
    }>;
    disabled?: boolean;
};

export const CollapsibleTrigger = forwardRef((props: CollapsibleTriggerProps, ref) => {
    const { setIsOpen, } = useContext(CollapsibleContext);

    const { children } = props;

    if (!React.isValidElement(children)) return null;

    return React.cloneElement(children, {
        ...children.props,
        onPress: (...args: any[]) => {
            setIsOpen(prev => !prev);
            children.props?.onPress?.(...args);
        },
        ref,
    } as any);
})
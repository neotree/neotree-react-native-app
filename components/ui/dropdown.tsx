import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Platform, TouchableOpacity, TouchableOpacityProps, TouchableWithoutFeedback, View, ViewProps } from "react-native";
import Svg, { Path } from 'react-native-svg';
import clsx from "clsx";
import { Separator } from "./separator";

export type DropdownProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export type DropdownTriggerProps = TouchableOpacityProps & {
    
};

export type DropdownItemProps = TouchableOpacityProps & {
    value?: string | number;
};

export type DropdownContentProps = ViewProps & {

};

type Items = { [key: string]: DropdownItemProps; };

type ContextType = DropdownProps & {
    top: number;
    open: boolean;
    items: Items,
    containerRef: React.RefObject<View>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setItems: React.Dispatch<React.SetStateAction<Items>>;
};

const Context = createContext<ContextType>(null!);

export function Dropdown({
    children,
    open: openProp,
    onOpenChange,
    ...props
}: React.PropsWithChildren<DropdownProps>) {
    const containerRef = useRef<View>(null);

    const [top, setTop] = useState(0);
    const [open, setOpen] = useState(!!openProp);
    const [items, setItems] = useState<ContextType['items']>({});

    useEffect(() => { setOpen(!!openProp); }, [openProp]);

    useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

    useEffect(() => {
        containerRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
            const topOffset = pageY;
            const heightOfComponent = height;

            const finalValue = topOffset + heightOfComponent + 
                (Platform.OS === "android" ? -32 : 3);

            setTop(finalValue || 0);
        });
    }, []);

    return (
        <Context.Provider
            value={{
                ...props,
                items,
                top,
                open,
                containerRef,
                setItems,
                setOpen,
            }}
        >
            <View
                ref={containerRef}
                onLayout={e => {
                    // const layout = e.nativeEvent.layout;
                    // const topOffset = layout.y;
                    // const heightOfComponent = layout.height;

                    // const finalValue = topOffset + heightOfComponent + 
                    //     (Platform.OS === "android" ? -32 : 3);

                    // setTop(finalValue);
                }}
            >
                {children}
            </View>
        </Context.Provider>
    );
}

export function DropdownTrigger({
    children,
    className,
    onPress,
    ...props
}: DropdownTriggerProps) {
    const {
        open,
        setOpen,
    } = useContext(Context);

    return (
        <>
            <TouchableOpacity
                {...props}
                onPress={(...args) => {
                    onPress?.(...args);
                    setOpen(prev => !prev);
                }}
                className={clsx(
                    'border border-border px-2 py-2 rounded-lg flex-row items-center',
                    className,
                )}
            >
                <View className="flex-1">
                    {children}
                </View>
                
                <View>
                    {open ? (
                        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="w-4 h-4 stroke-primary">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </Svg>                      
                    ) : (
                        <Svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="w-4 h-4 stroke-primary">
                            <Path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </Svg>
                    )}
                </View>
            </TouchableOpacity>
        </>
    );
}

export function DropdownItem(props: DropdownItemProps) {
    const {
        open,
        setOpen,
        setItems,
    } = useContext(Context);

    const [id] = useState(Math.random().toString(36));

    useEffect(() => {
        setItems(prev => ({ ...prev, [id]: props, }));
        return () => setItems(prev => Object.keys(prev).reduce((acc, key) => {
            if (key === id) return acc;
            return {
                ...acc,
                [key]: prev[key],
            };
        }, {} as Items));
    }, [id, props, setItems]);

    return null;
}

export function DropdownContent({
    children,
    className,
    ...props
}: DropdownContentProps) {
    const {
        top,
        open,
        items,
        setOpen,
    } = useContext(Context);

    const data = useMemo(() => Object.keys(items).map(id => ({
        id,
        ...items[id],
    })), [items]);

    return (
        <>
            <Modal
                visible={open}
                transparent
            >
                <TouchableWithoutFeedback 
                    onPress={() => setOpen(false)}
                >
                    <View
                        className="flex-1"
                    >
                        <View
                            {...props}
                            style={{ top }}
                            className={clsx(
                                'bg-background border border-border absolute',
                                className,
                            )}
                        >
                            <FlatList
                                keyExtractor={(item) => item.id}
                                data={data}
                                ItemSeparatorComponent={() => <Separator />}
                                renderItem={({ item: { value, ...props } }) => (
                                    <TouchableOpacity
                                        {...props}
                                        className={clsx(
                                            'py-2 px-2 flex-row',
                                            props.className
                                        )}
                                        onPress={(...args) => {
                                            props.onPress?.(...args);
                                        }}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <View style={{ display: 'none', }}>
                {children}
            </View>
        </>
    );
}
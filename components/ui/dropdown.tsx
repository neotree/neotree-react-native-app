import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Platform, TouchableOpacity, TouchableOpacityProps, TouchableWithoutFeedback, View, ViewProps } from "react-native";
import Svg, { Path } from 'react-native-svg';
import clsx from "clsx";
import { Separator } from "./separator";
import { Text } from "./text";

export type DropdownProps = {
    open?: boolean;
    disabled?: boolean;
    selected?: string | number | (string | number)[];
    selectMultiple?: boolean;
    title?: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    onSelect?: (value: number | string) => void;
};

export type DropdownTriggerProps = TouchableOpacityProps & {
    
};

export type DropdownItemProps = TouchableOpacityProps & {
    value?: string | number;
    searchValue?: string;
};

export type DropdownContentProps = ViewProps & {

};

type ItemState = DropdownItemProps & { selected: boolean; };

type Items = { [key: string]: ItemState; };

type ContextType = DropdownProps & {
    open: boolean;
    items: Items,
    containerRef: React.RefObject<View>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setItems: React.Dispatch<React.SetStateAction<Items>>;
    setItem: (id: string, item: Partial<ItemState>) => void
};

const Context = createContext<ContextType>(null!);

export function Dropdown({
    children,
    open: openProp,
    onOpenChange,
    ...props
}: React.PropsWithChildren<DropdownProps>) {
    const containerRef = useRef<View>(null);

    const [open, setOpen] = useState(!!openProp);
    const [items, setItems] = useState<ContextType['items']>({});

    useEffect(() => { setOpen(!!openProp); }, [openProp]);

    useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

    const setItem = useCallback((id: string, item: Partial<ItemState>) => {
        setItems(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                ...item,
            },
        }));
    }, []);

    return (
        <Context.Provider
            value={{
                ...props,
                items,
                open,
                containerRef,
                setItems,
                setOpen,
                setItem,
            }}
        >
            <View ref={containerRef}>
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
        items,
        disabled,
        setOpen,
    } = useContext(Context);

    const [selected] = useMemo(() => Object.values(items).filter(item => item.selected), [items]);

    return (
        <>
            <TouchableOpacity
                {...props}
                disabled={disabled || props.disabled}
                onPress={(...args) => {
                    onPress?.(...args);
                    setOpen(prev => !prev);
                }}
                className={clsx(
                    'border px-2 py-2 rounded-lg flex-row items-center border-primary/20 bg-primary/10',
                    disabled && 'opacity-50',
                    className,
                )}
            >
                <View className="flex-1">
                    {((children: React.ReactNode) => (
                        <>
                            {typeof children !== 'string' ? children : (
                                <>
                                    <Text>{children}</Text>
                                </>
                            )}
                        </>
                    ))(selected?.children || children)}
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
        selected,
        setItems,
    } = useContext(Context);

    const [id] = useState(Math.random().toString(36));

    useEffect(() => {
        const _selected = selected ? typeof selected === 'object' ? selected : [selected] : [];

        setItems(prev => {
            return { 
                ...prev, 
                [id]: { ...props, selected: _selected.includes(props.value!), }, 
            };
        });
        return () => setItems(prev => Object.keys(prev).reduce((acc, key) => {
            if (key === id) return acc;
            return {
                ...acc,
                [key]: prev[key],
            };
        }, {} as Items));
    }, [id, props, selected, setItems]);

    return null;
}

export function DropdownContent({ children }: DropdownContentProps) {
    const {
        open,
        items,
        selectMultiple,
        title,
        setItems,
        setItem,
        setOpen,
        onSelect,
    } = useContext(Context);

    const data = useMemo(() => Object.keys(items).map(id => ({
        id,
        ...items[id],
    })), [items]);

    return (
        <>
            <Modal
                statusBarTranslucent
                visible={open}
                transparent
                onRequestClose={() => setOpen(false)}
            >
                <View className="flex-1">
                    <TouchableWithoutFeedback 
                        onPress={() => setOpen(false)}
                    >
                        <View 
                            className="
                                absolute
                                flex-1
                                bg-black/50
                                w-full
                                top-0
                                bottom-0
                            "
                        />
                    </TouchableWithoutFeedback>

                    <View
                        className="
                            m-auto 
                            w-[90%] 
                            max-w-lg
                            max-h-[90%]
                            rounded-lg
                            overflow-hidden
                        "
                    >
                        <View
                            className={clsx(
                                'bg-background border border-border',
                            )}
                            style={{
                                elevation: 24,
                                shadowColor: 'rgba(0,0,0,.5)',
                                shadowOffset: { width: -2, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                            }}
                        >
                            {!!title && (
                                <>
                                    <View
                                        className="p-4"
                                    >
                                        {typeof title !== 'string' ? title : (
                                            <>
                                                <Text variant="title">{title}</Text>
                                            </>
                                        )}
                                    </View>
                                    <Separator />
                                </>
                            )}
                            <FlatList
                                keyExtractor={(item) => item.id}
                                data={data}
                                ItemSeparatorComponent={() => <Separator />}
                                renderItem={({ item }) => {
                                    const { value, children, ...props } = item;

                                    return (
                                        <TouchableOpacity
                                            {...props}
                                            className={clsx(
                                                'py-2 px-4 flex-row items-center',
                                                item.selected && 'bg-primary-100',
                                                props.className
                                            )}
                                            onPress={(...args) => {
                                                props.onPress?.(...args);
                                                if (value) {
                                                    onSelect?.(value);
                                                    if (selectMultiple) {
                                                        setItem(item.id, { selected: !item.selected, });
                                                    } else {
                                                        setItems(prev => Object.keys(prev).reduce((acc, key) => {
                                                            return {
                                                                ...acc,
                                                                [key]: {
                                                                    ...prev[key],
                                                                    selected: key === item.id ? !item.selected : false,
                                                                },
                                                            };
                                                        }, prev));
                                                        setOpen(false);
                                                    }
                                                }
                                            }}
                                        >
                                            {!!item.selected && (
                                                <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="mr-2 w-4 h-4 stroke-primary">
                                                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </Svg>                                    
                                            )}
                                            
                                            {typeof children !== 'string' ? children : (
                                                <>
                                                    <Text>{children}</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={{ display: 'none', }}>
                {children}
            </View>
        </>
    );
}
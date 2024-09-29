import React, { 
    useState, 
    useEffect, 
    useCallback, 
    useMemo, 
    createContext, 
    useContext 
} from "react";
import { 
    Modal as RNModal, 
    ModalProps as RNModalProps, 
    View, 
    TouchableOpacity, 
    ScrollView, 
    Dimensions, 
    TouchableOpacityProps, 
    GestureResponderEvent 
} from "react-native";

import { Card, CardContent, CardFooter, CardTitle } from "./card";
import { Separator } from "./separator";
import { Text } from "./text";
import clsx from "clsx";
import { ButtonProps } from "./button";

const { height: windowHeight } = Dimensions.get('window');
const MAX_CONTENT_HEIGHT = windowHeight * 0.8;

export type ModalAction = {
    label: React.ReactNode;
    destructive?: boolean;
    color?: 'danger' | 'secondary';
    outlined?: boolean;
    onPress?: () => void;
};

export type ModalProps = RNModalProps & {
    title?: React.ReactNode;
    open?: boolean;
    closeOnClickAway?: boolean;
    actions?: ModalAction[];
    onOpenChange?: (open: boolean) => void;
};

interface IContext {
    isOpen: boolean;
    props: ModalProps;
    onClose: () => void;
    onOpen: () => void;
}

const ModalContext = createContext<IContext>(null!);

const useModalContext = () => useContext(ModalContext);

export function Modal(props: ModalProps) {
    const {
        children,
        open,
        onOpenChange,
    } = props;

    const [isOpen, setIsOpen] = useState(!!open);

    useEffect(() => { setIsOpen(!!open); }, [open]);

    const onOpen = useCallback(() => {
        onOpenChange?.(true);
        setIsOpen(true);
    }, [onOpenChange]);

    const onClose = useCallback(() => {
        onOpenChange?.(false);
        setIsOpen(false);
    }, [onOpenChange]);

    return (
        <ModalContext.Provider
            value={{
                isOpen,
                props,
                onClose,
                onOpen,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
}

export type ModalContentProps = React.PropsWithChildren<{
    
}>;

export function ModalContent({ children, }: ModalContentProps) {
    const {
        isOpen,
        props: {
            title,
            closeOnClickAway = true,
            actions = [],
        },
        onClose,
    } = useModalContext();

    const displayActions = useMemo(() => actions.map((a, i) => ({
        ...a,
        id: i + 1,
        isLast: i === (actions.length - 1),
    })), [actions]);

    return (
        <>
            <RNModal
                statusBarTranslucent
                transparent
                visible={isOpen}
                onRequestClose={() => {}}
            >
                <View className="flex-1">
                    <TouchableOpacity 
                        disabled={!closeOnClickAway}
                        className="
                            absolute
                            flex-1
                            bg-black/50
                            w-full
                            top-0
                            bottom-0
                        "
                        onPress={() => onClose()}
                    />

                    <View 
                        className="
                            m-auto 
                            w-[90%] 
                            max-w-lg
                            max-h-[100%]
                            rounded-lg
                            overflow-hidden
                        "
                    >
                        <Card
                            style={{
                                elevation: 24,
                                shadowColor: 'rgba(0,0,0,.5)',
                                shadowOffset: { width: -2, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                            }}
                        >
                            <CardContent className="p-0">
                                {!!title && <CardTitle className="py-2 px-3">{title}</CardTitle>}

                                <View 
                                    style={{ maxHeight: MAX_CONTENT_HEIGHT, }}
                                    className={clsx(
                                        'py-2 px-3',
                                        !!title && 'pt-0',
                                    )}
                                >
                                    <ScrollView>
                                        {children}
                                    </ScrollView>
                                </View>

                                {!!displayActions.length && (
                                    <>
                                        <Separator />
                                        <CardFooter className="gap-x-0">
                                            {displayActions.map(a => {
                                                return (
                                                    <TouchableOpacity
                                                        key={a.id}
                                                        onPress={() => {
                                                            if (a.destructive) onClose();
                                                            a.onPress?.();
                                                        }}
                                                        className={clsx(
                                                            'flex flex-row px-4 py-2 border-l border-l-border bg-primary',
                                                            a.color === 'danger' && 'bg-danger',
                                                            a.color === 'secondary' && 'bg-secondary',
                                                            a.isLast && 'rounded-br-lg',
                                                        )}
                                                    >
                                                        <Text
                                                            className={clsx(
                                                                'font-bold uppercase text-primary-foreground',
                                                                a.color === 'danger' && 'text-danger-foreground',
                                                                a.color === 'secondary' && 'text-secondary-foreground',
                                                            )}
                                                        >
                                                            {a.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </CardFooter>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </View>
                </View>
            </RNModal>
        </>
    );
}

export type ModalTriggerProps = TouchableOpacityProps & {
    as?: React.ComponentType;
};

export function ModalTrigger({ 
    as,
    onPress: onPressProp,
    ...props 
}: ModalTriggerProps) {
    const { onOpen } = useModalContext();

    const onPress = useCallback((e: GestureResponderEvent) => {
        onOpen();
        onPressProp?.(e);
    }, [onPressProp, onOpen]);

    const Component = as || TouchableOpacity;

    return (
        <Component 
            {...props}
            onPress={onPress}
        />
    );
}

export type ModalCloseProps = ButtonProps & {
    as?: React.ComponentType;
};

export function ModalClose({ 
    as,
    onPress: onPressProp,
    ...props 
}: ModalCloseProps) {
    const { onClose } = useModalContext();

    const onPress = useCallback((e: GestureResponderEvent) => {
        onClose();
        onPressProp?.(e);
    }, [onPressProp, onClose]);

    const Component = as || TouchableOpacity;

    return (
        <Component 
            {...props}
            onPress={onPress}
        />
    );
}

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
    TouchableWithoutFeedback,
    TouchableOpacityProps, 
    GestureResponderEvent, 
} from "react-native";

import { Card, CardContent, CardFooter, CardTitle, CardTitleProps, CardFooterProps } from "./card";
import { Text } from "./text";
import clsx from "clsx";
import { ButtonProps } from "./button";

const { height: windowHeight } = Dimensions.get('window');
const MAX_CONTENT_HEIGHT = windowHeight * 0.8;

export type ModalProps = RNModalProps & {
    title?: React.ReactNode;
    titleProps?: CardTitleProps;
    open?: boolean;
    closeOnClickAway?: boolean;
    onOpenChange?: (open: boolean) => void;
};

type ModalFooterProps = CardFooterProps;

interface IContext {
    isOpen: boolean;
    props: ModalProps;
    footer: null | ModalFooterProps;
    onClose: () => void;
    onOpen: () => void;
    setFooter: React.Dispatch<React.SetStateAction<null | ModalFooterProps>>;
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
    const [footer, setFooter] = useState<IContext['footer']>(null);

    useEffect(() => { setIsOpen(!!open); }, [open]);

    const onOpen = useCallback(() => {
        setIsOpen(true);
        onOpenChange?.(true);
    }, [onOpenChange]);

    const onClose = useCallback(() => {
        setIsOpen(false);
        onOpenChange?.(false);
    }, [onOpenChange]);

    return (
        <ModalContext.Provider
            value={{
                isOpen,
                props,
                footer,
                setFooter,
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
        footer,
        props: {
            title,
            closeOnClickAway = true,
            titleProps,
        },
        onClose,
    } = useModalContext();

    return (
        <>
            <RNModal
                statusBarTranslucent
                transparent
                visible={isOpen}
                onRequestClose={() => onClose()}
            >
                <View className="flex-1">
                    <TouchableWithoutFeedback 
                        disabled={!closeOnClickAway}
                        onPress={() => onClose()}
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
                                {!!title && <CardTitle {...titleProps} className={clsx('py-4 px-3', titleProps?.className)}>{title}</CardTitle>}

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

                                {!!footer && (
                                    <>
                                        <CardFooter 
                                            {...footer}
                                            className={clsx(
                                                'py-4 px-4',
                                                footer.className,
                                            )}
                                        />
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

export function ModalFooter(props: ModalFooterProps) {
    const { setFooter } = useContext(ModalContext);
    useEffect(() => { setFooter(props); }, [props, setFooter]);
    return null;
}
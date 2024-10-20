'use client';

import { useCallback } from "react";
import { View } from "react-native";
import Icon from '@expo/vector-icons/Feather';

import { useAlertModal } from "@/hooks/use-alert-modal";
import { Modal, ModalContent, ModalFooter, ModalClose } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

export function AlertModal() {
    const { 
        isOpen, 
        title, 
        message, 
        variant, 
        buttonLabel, 
        close, 
        onClose, 
    } = useAlertModal();

    const closeModal = useCallback(() => {
        onClose?.();
        close();
    }, [close, onClose]);

    return (
        <>
            <Modal
                open={isOpen}
                onOpenChange={closeModal}
                title={title}
                titleProps={{ textProps: { className: 'text-center', }, }}
            >
                <ModalContent>
                    <View className="gap-y-1">
                        {variant === 'error' && (
                            <View className="flex-row justify-center">
                                <Icon 
                                    name="alert-triangle" 
                                    color={'#ff7675'}
                                    size={48}
                                />
                            </View>
                        )}

                        {variant === 'success' && (
                            <View className="flex-row justify-center">
                                <Icon 
                                    name="check-circle" 
                                    color={'#55efc4'}
                                    size={48}
                                />
                            </View>
                        )}

                        <Text className="text-center">{message}</Text>
                    </View>

                    <ModalFooter>
                        <ModalClose 
                            as={Button}
                        >
                            {buttonLabel}
                        </ModalClose>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
  
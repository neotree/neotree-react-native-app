'use client';

import { View } from "react-native";
import Icon from '@expo/vector-icons/Feather'

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
  
export function ConfirmModal() {
    const { 
        isOpen, 
        danger,
        title, 
        message, 
        positiveLabel, 
        negativeLabel, 
        close, 
        onConfirm, 
    } = useConfirmModal();

    return (
        <Modal
            open={isOpen}
            onOpenChange={close}
            title={title}
            titleProps={{ textProps: { className: 'text-center', }, }}
            actions={[
                {
                    label: negativeLabel,
                    destructive: true,
                    color: danger ? 'danger' : undefined,
                },
                {
                    label: positiveLabel,
                    destructive: true,
                    onPress: onConfirm,
                },
            ]}
        >
            <ModalContent>
                <View className="gap-y-1">
                    {danger && (
                        <View className="flex-row justify-center">
                            <Icon 
                                name="alert-triangle" 
                                color={'#ff7675'}
                                size={48}
                                />
                        </View>
                    )}

                    <Text className="text-center">{message}</Text>
                </View>
            </ModalContent>
        </Modal>
    );
}
  
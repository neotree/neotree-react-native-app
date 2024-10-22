import { View } from "react-native";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Modal, ModalContent, ModalClose, ModalFooter } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Exclamation } from "@/components/svgs/exclamation";
  
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
        >
            <ModalContent>
                <View className="gap-y-1">
                    {danger && (
                        <View className="flex-row justify-center">
                            <Exclamation 
                                svgClassName="stroke-danger w-20 h-20"
                            />
                        </View>
                    )}

                    <Text className="text-center">{message}</Text>
                </View>

                <ModalFooter>
                    <ModalClose
                        as={Button}
                        variant="ghost"
                    >
                        <Text>{negativeLabel}</Text>
                    </ModalClose>

                    <ModalClose
                        as={Button}
                        onPress={onConfirm}
                        color={danger ? 'error' : undefined}
                    >
                        {positiveLabel}
                    </ModalClose>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
  
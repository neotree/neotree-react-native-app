import { useConfirm } from "@/src/hooks/use-confirm";
import { Text, Modal } from '@/src/components';

export function ConfirmModal() {
    const { options, onClose } = useConfirm();

    return (
        <>
            <Modal
                {...options?.modalProps}
                open={!!options}
                onRequestClose={onClose}
                onClose={onClose}
                scrollable
                title={options?.title}
                actions={[
                    {
                        label: options?.negativeLabel || 'Cancel',
                        color: 'secondary',
                        onPress: () => options?.onNegative?.(),
                    },
                    {
                        label: options?.positiveLabel || 'Okay',
                        color: 'primary',
                        onPress: () => options?.onPositive?.(),
                    },
                ]}
            >
                {!!options && (
                    <>
                        {typeof options.message !== 'string' ? options.message : (
                            <Text>
                                {options.message}
                            </Text>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
}

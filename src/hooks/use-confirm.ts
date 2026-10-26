import { create } from "zustand";

import { ModalProps } from "@/src/components";

type ConfirmOptions = {
    title?: React.ReactNode;
    message: React.ReactNode;
    negativeLabel?: string;
    positiveLabel?: string;
    modalProps?: Partial<ModalProps>;
    onPositive?: () => void;
    onNegative?: () => void;
};

type ConfirmState = {
    options: null | ConfirmOptions;
    onClose: () => void;
    confirm: (options: ConfirmOptions) => void;
};

export const useConfirm = create<ConfirmState>(set => {
    const onClose = () => set({ options: null, });

    return {
        options: null,

        onClose,

        confirm(options: ConfirmOptions) {
            set({
                options: {
                    ...options,
                    onNegative() {
                        onClose();
                        options?.onNegative?.();
                    },
                    onPositive() {
                        onClose();
                        options?.onPositive?.();
                    },
                },
            })
        },
    };
});

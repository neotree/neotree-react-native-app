'use client';

import { useCallback } from "react";

import { useAlertModal } from "@/hooks/use-alert-modal";
  
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
        
        </>
    );
}
  
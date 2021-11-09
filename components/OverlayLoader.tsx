import React from 'react';
import { Modal, ModalProps, View } from 'react-native';
import { Loader } from '@/components/ui';

export function OverlayLoader(props: ModalProps) {
    return (
        <Modal
            transparent
            {...props}
            visible={props.visible !== false}
        >
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Loader size="large" />
            </View>
        </Modal>
    );
}

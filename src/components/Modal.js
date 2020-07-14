import React from 'react';
import PropTypes from 'prop-types';
import { View, Modal as RNModal, TouchableWithoutFeedback, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,      
    },
    overlayWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      padding: 35,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      maxWidth: '90%',
      maxHeight: '90%',
    },
  });

export default function Modal({ open, onClose, modalProps, style, ...props }) {
    return (
        <>
            <RNModal
                {...modalProps}
                transparent={true}
                visible={open}
            >
                <TouchableWithoutFeedback  
                    onPress={onClose} 
                    style={[styles.overlayWrap]} 
                ><View style={[styles.overlay]} /></TouchableWithoutFeedback>
                <View style={styles.centeredView}>
                    <View 
                    {...props} 
                    style={[
                        styles.modalView, 
                        ...(style ? style.map ? style : [style] : [])
                    ]} 
                />
                </View>
            </RNModal>
        </>
    );
}

Modal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    modalProps: PropTypes.object,
};

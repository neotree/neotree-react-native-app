import React from 'react';
import PropTypes from 'prop-types';
import { View, Modal, TouchableWithoutFeedback } from 'react-native';
import _spacing from '@/utils/spacing';

const styles = {
  inputBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modal: {

  },
  modalContentWrap: {
    flex: 1,
    alignItems: 'center',
    justifyCOntent: 'center',
  },
  modalContentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
  },
};

const Dropdown = ({ style, border, spacing, ...props }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TouchableWithoutFeedback
        style={[
          styles.inputBox,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >

      </TouchableWithoutFeedback>

      <Modal
        transparent
        visible={open}
        style={[styles.modal]}
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={[styles.modalContentWrap]}
        >
          <TouchableWithoutFeedback 
            style={[styles.modalContentOverlay]}
          />
          <View 
            style={[styles.modalContent]}
          />
        </View>
      </Modal>
    </>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Dropdown;

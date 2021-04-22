import React from 'react';
import PropTypes from 'prop-types';
import Fab from '@/components/Fab';
import { MaterialIcons } from '@expo/vector-icons';

export default function FloatingButton() {
  return (
    <>
      <Fab
        onPress={() => {
          (async () => {

          })();
        }}
      >
        <MaterialIcons size={24} color="black" style={{ color: '#fff' }} name="check" />
      </Fab>
    </>
  );
}

FloatingButton.propTypes = {

};

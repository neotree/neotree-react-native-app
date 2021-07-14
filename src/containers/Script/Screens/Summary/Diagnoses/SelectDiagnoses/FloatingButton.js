import React from 'react';
import PropTypes from 'prop-types';
import Fab from '@/components/Fab';
import { MaterialIcons } from '@expo/vector-icons';
import FinalActionButton from '../FinalActionButton';

export default function FloatingButton(props) {
  const { setSection, diagnoses } = props;

  if (!diagnoses.length) return <FinalActionButton {...props} />;

  return (
    <>
      <Fab
        onPress={() => setSection('manage_selected')}
      >
        <MaterialIcons size={24} color="black" style={{ color: '#fff' }} name="arrow-forward" />
      </Fab>
    </>
  );
}

FloatingButton.propTypes = {
  setSection: PropTypes.func.isRequired,
  diagnoses: PropTypes.array.isRequired,
};

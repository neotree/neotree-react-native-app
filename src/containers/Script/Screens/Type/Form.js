import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const Form = ({ screen }) => {
  const { metadata } = screen.data;

  return (
    <>
      <View>
        <Typography />
      </View>
    </>
  );
};

Form.propTypes = {
  screen: PropTypes.object
};

export default Form;

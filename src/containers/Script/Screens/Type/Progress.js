import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const Progress = ({ screen }) => {
  const { metadata } = screen.data;

  return (
    <>
      <View>
        <Typography />
      </View>
    </>
  );
};

Progress.propTypes = {
  screen: PropTypes.object
};

export default Progress;

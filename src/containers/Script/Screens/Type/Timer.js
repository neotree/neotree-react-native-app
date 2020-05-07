import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const Timer = ({ screen }) => {
  const { metadata } = screen.data;

  return (
    <>
      <View>
        <Typography />
      </View>
    </>
  );
};

Timer.propTypes = {
  screen: PropTypes.object
};

export default Timer;

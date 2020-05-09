import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const Management = ({ screen }) => {
  const { metadata } = screen.data;

  return (
    <>
      <View>
        <Typography />
      </View>
    </>
  );
};

Management.propTypes = {
  screen: PropTypes.object
};

export default Management;

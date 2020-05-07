import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const YesNo = ({ screen }) => {
  const { metadata } = screen.data;

  return (
    <>
      <View>
        <Typography>{metadata.negativeLabel}</Typography>
        <Typography>{metadata.positiveLabel}</Typography>
      </View>
    </>
  );
};

YesNo.propTypes = {
  screen: PropTypes.object
};

export default YesNo;

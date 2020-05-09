import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const TypeChecklist = ({ screen }) => {
  const { metadata } = screen.data;
  console.log(metadata);
  return (
    <>
      <View>
        <Typography />
      </View>
    </>
  );
};

TypeChecklist.propTypes = {
  screen: PropTypes.object
};

export default TypeChecklist;

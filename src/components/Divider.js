import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import _spacing from '@/utils/spacing';

const Divider = ({ style, border, spacing, ...props }) => {
  return (
    <View
      {...props}
      style={[
        {
          marginVertical: _spacing(spacing),
          backgroundColor: border === false ? 'transparent' : '#ddd',
          height: 1,
        },
        ...(style ? style.map ? style : [style] : [])
      ]}
    />
  );
};

Divider.propTypes = {
  spacing: PropTypes.number,
  border: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Divider;

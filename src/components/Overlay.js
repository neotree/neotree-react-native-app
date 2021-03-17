import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

const Overlay = ({ style, color, ...props }) => {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: color || 'rgba(0,0,0,.5)',
          flex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        },
        ...(style ? style.map ? style : [style] : [])
      ]}
    />
  );
};

Overlay.propTypes = {
  color: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Overlay;

import React from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';

const Icon = ({ name, style, color, ...props }) => {
  return (
    <>
      <Ionicons
        {...props}
        name={name}
        color={color}
        style={[
          ...(style ? style.map ? style : [style] : [])
        ]}
      />
    </>
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'disabled', 'error', 'success']),
  size: PropTypes.number,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Icon;

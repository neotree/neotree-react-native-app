import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';

const Logo = ({ style, size }) => {
  return (
    <>
      <Image
        source={require('~/assets/images/neotree-icon-black.png')}
        style={[
          style,
          {
            width: size || 90,
            height: size || 90,
            borderRadius: 45,
            // backgroundColor: palette[color] ? palette[color].main : 'transparent'
          },
        ]}
      />
    </>
  );
};

Logo.propTypes = {
  style: PropTypes.object,
  size: PropTypes.number,
};

export default Logo;

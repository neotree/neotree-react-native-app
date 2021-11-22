import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';

const Logo = ({ style, size, color }) => {
  const src = color === 'white' ?
    require('~/assets/images/logo.png')
    :
    require('~/assets/images/logo-dark.png');

  return (
    <>
      <Image
        source={src}
        style={[
          style,
          {
            width: size || 90,
            height: size || 90,
            // borderRadius: 45,
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
  color: PropTypes.oneOf(['black', 'white']),
};

export default Logo;

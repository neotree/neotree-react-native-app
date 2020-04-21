import React from 'react';
import PropTypes from 'prop-types';
import constants from '@/constants';
import { Image } from 'react-native';
import useTheme from '@/ui/styles/useTheme';

const Logo = ({ color, style, size }) => {
  const { palette, spacing } = useTheme();

  // const img = Image.resolveAssetSource(require('~/assets/images/neotree.png'));

  return (
    <>
      <Image
        source={require('~/assets/images/neotree.png')}
        style={[
          style,
          {
            width: size || 90,
            height: size || 90,
            borderRadius: 45,
            backgroundColor: palette[color] ? palette[color].main : 'transparent'
          },
        ]}
      />
    </>
  );
};

Logo.propTypes = {
  style: PropTypes.object,
  size: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'secondary'])
};

export default Logo;

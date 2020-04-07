import React from 'react';
import PropTypes from 'prop-types';
import constants from '@/constants';
import { Image } from 'react-native';
import useTheme from '@/ui/styles/useTheme';

const Logo = ({ color, style }) => {
  const { palette, spacing } = useTheme();

  // const img = Image.resolveAssetSource(require('~/assets/images/neotree.png'));

  return (
    <>
      <Image
        source={require('~/assets/images/neotree.png')}
        style={[
          {
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: palette[color] ? palette[color].main : 'transparent'
          },
          style,
        ]}
      />
    </>
  );
};

Logo.propTypes = {
  style: PropTypes.object,
  color: PropTypes.oneOf(['primary', 'secondary'])
};

export default Logo;

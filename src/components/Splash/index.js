import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Logo from '@/components/Logo';
import { Text } from 'native-base';
import constants from '@/constants';

const Splash = ({ children }) => {
  return (
    <>
      <View
        style={[{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff'
        }]}
      >
        <View
          style={[{
            alignItems: 'center',
            justifyContent: 'center',
          }]}
        >
          <View
            style={[
              {
                alignItems: 'center',
                justifyContent: 'center',
                height: constants.SPLASH_LOGO_HEIGHT,
                width: constants.SPLASH_LOGO_WIDTH,
                margin: constants.DEFAULT_SPACING
              }
            ]}
          >
            <Logo />
          </View>
          {typeof children === 'string' ?
            <Text>{children}</Text>
            :
            children}
        </View>
      </View>
    </>
  );
};

Splash.propTypes = {
  children: PropTypes.node
};

export default Splash;

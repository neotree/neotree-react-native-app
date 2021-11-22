import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, StatusBar } from 'react-native';

function Splash({ children }) {
  return (
    <>
      <StatusBar translucent backgroundColor="#fff" barStyle="dark-content" />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <Image
          style={{ width: 80, height: 80 }}
          source={require('~/assets/images/logo.png')}
        />

        {!!children && (
          <View
            style={{
              position: 'absolute',
              bottom: 50,
              width: '100%',
              left: 0,
              alignItems: 'center',
            }}
          >
            {children}
          </View>
        )}
      </View>
    </>
  );
}

Splash.propTypes = {
  children: PropTypes.node,
};

export default Splash;

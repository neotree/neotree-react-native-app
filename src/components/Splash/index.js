import React from 'react';
import PropTypes from 'prop-types';
import { View, Modal } from 'react-native';
import Logo from '@/components/Logo';
import Divider from '@/components/Divider';
import { Text } from 'native-base';
import constants from '@/constants';
 
const Splash = ({ text, children }) => {
  return (
    <Modal transparent open>
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
          {!text ? null : (
            <>
              <Divider border={false} />
              <Text style={{ color: '#999' }}>{text}</Text>
              <Divider border={false} />
            </>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
};

Splash.propTypes = {
  text: PropTypes.string,
  children: PropTypes.node,
};

export default Splash;

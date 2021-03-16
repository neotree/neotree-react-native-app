import React from 'react';
import { BackHandler, Platform } from 'react-native';

export default (cb, params) => {
  React.useEffect(() => {
    let backHandler = null;

    if (Platform.OS === 'android') {
      backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        cb
      );
    }

    return () => {
      if (backHandler) backHandler.remove();
    };
  }, params);
};

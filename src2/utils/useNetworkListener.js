import React from 'react';
import NetInfo from '@react-native-community/netinfo';

export default function useNetworkListener(cb) {
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => cb && cb(state));

    return () => unsubscribe();
  }, []);
}

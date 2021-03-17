import React from 'react';
import { View } from 'react-native';
import copy from '@/constants/copy';
import { Text } from 'native-base';
import NetInfo from '@react-native-community/netinfo';

const NetworkStatusBar = () => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [displayBar, setDisplayBar] = React.useState(false);

  React.useEffect(() => {
    let unsubscribe;

    (async () => {
      const networkStatusHandler = networkState => {
        if (!networkState) return;
        const isOnline = networkState.isInternetReachable;
        setIsOnline(isOnline);
        setDisplayBar(!isOnline);
      };

      try {
        const neworkState = await NetInfo.fetch();
        networkStatusHandler(neworkState);
      } catch (e) { /* Do nothing */ }

      unsubscribe = NetInfo.addEventListener(networkStatusHandler);
    })();

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    let timeOut = null;

    if (!isOnline) {
      setIsOnline(false);
    } else {
      timeOut = setTimeout(() => setDisplayBar(false), 1000);
    }

    return () => clearTimeout(timeOut);
  }, [isOnline]);

  if (!displayBar) return null;

  return (
    <>
      <View
        style={[
          {
            padding: 3,
            textAlign: 'center',
            backgroundColor: isOnline ? '#2ecc71' : '#999',
          }
        ]}
      >
        <Text
          style={[
            {
              color: isOnline ? '#fff' : '#ccc',
              fontSize: 15,
              textAlign: 'center',
            }
          ]}
        >
          {isOnline ? copy.ONLINE_MESSAGE : copy.OFFLINE_MESSAGE}
        </Text>
      </View>
    </>
  );
};

export default NetworkStatusBar;

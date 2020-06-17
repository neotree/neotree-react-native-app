import React from 'react';
import { useNetworkContext } from '@/contexts/network';
import { View } from 'react-native';
import copy from '@/constants/copy';
import { Text } from 'native-base';

const NetworkStatusBar = () => {
  const networkState = useNetworkContext();

  const [isOnline, setIsOnline] = React.useState(true);
  const [displayBar, setDisplayBar] = React.useState(false);

  React.useEffect(() => {
    if (networkState) {
      const isOnline = networkState.isInternetReachable;
      setIsOnline(isOnline);
      setDisplayBar(!isOnline);
    }
  }, [networkState]);

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
              fontSize: 15
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

import React from 'react';
import LazyComponent from '@/components/LazyComponent';
import { Button, Icon } from 'native-base';
import { View } from 'react-native';
import Constants from 'expo-constants';
import { useAppContext } from '@/contexts/app';

const Page = LazyComponent(() => import('./Page'));

const Debug = () => {
  const { state: { hideDebugButton } } = useAppContext();
  const [canDebug, setCanDebug] = React.useState(false);

  if (hideDebugButton || (process.env.NODE_ENV !== 'development')) return null;

  return (
    <>
      {canDebug && <Page />}

      <View
        style={[
          {
            position: 'absolute',
            top: Constants.statusBarHeight,
            right: 10,
          }
        ]}
      >
        <Button
          transparent
          light={!canDebug}
          info={canDebug}
          onPress={() => setCanDebug(canDebug => !canDebug)}
        ><Icon name="bug" /></Button>
      </View>
    </>
  );
};

export default Debug;

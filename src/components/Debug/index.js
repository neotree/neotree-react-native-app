import React from 'react';
import LazyComponent from '@/components/LazyComponent';
import makeStyles from '@/ui/styles/makeStyles';
import IconButton from '@/ui/IconButton';
import { View } from 'react-native';
import Constants from 'expo-constants';
import { useAppContext } from '@/contexts/app';

const Page = LazyComponent(() => import('./Page'));

const useStyles = makeStyles({
  btn: {
    position: 'absolute',
    top: Constants.statusBarHeight,
    right: 10,
  }
});

const Debug = () => {
  const styles = useStyles();
  const { state: { hideDebugButton } } = useAppContext();
  const [canDebug, setCanDebug] = React.useState(false);

  if (hideDebugButton || (process.env.NODE_ENV !== 'development')) return null;

  return (
    <>
      {canDebug && <Page />}

      <View style={[styles.btn]}>
        <IconButton
          color={canDebug ? 'error' : 'disabled'}
          icon="md-bug"
          onPress={() => setCanDebug(canDebug => !canDebug)}
        />
      </View>
    </>
  );
};

export default Debug;

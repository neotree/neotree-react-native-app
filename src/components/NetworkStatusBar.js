import React from 'react';
import makeStyles from '@/ui/styles/makeStyles';
import { useNetworkContext } from '@/contexts/network';
import { View } from 'react-native';
import copy from '@/constants/copy';
import Typography from '@/ui/Typography';

const useStyles = makeStyles((theme, { isOnline }) => ({
  root: {
    padding: 3,
    textAlign: 'center',
    backgroundColor: isOnline ? theme.palette.success.main : '#999',
  },
  text: {
    color: isOnline ? theme.palette.success.text : '#ccc'
  }
}));

const NetworkStatusBar = () => {
  const networkState = useNetworkContext();

  const [isOnline, setIsOnline] = React.useState(true);
  const [displayBar, setDisplayBar] = React.useState(false);

  const styles = useStyles({ isOnline });

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
        style={[styles.root]}
      >
        <Typography
          variant="caption"
          style={[styles.text]}
        >
          {isOnline ? copy.ONLINE_MESSAGE : copy.OFFLINE_MESSAGE}
        </Typography>
      </View>
    </>
  );
};

export default NetworkStatusBar;

import React from 'react';
import { View, Alert } from 'react-native';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import { signOut } from '@/api/auth';
import { useNetworkContext } from '@/contexts/network';
import authCopy from '@/constants/copy/auth';
import copy from '@/constants/copy';
import { useDataContext } from '@/contexts/data';
import { useOverlayLoaderState } from '@/contexts/app';

const Profile = () => {
  const networkState = useNetworkContext();
  const dataContext = useDataContext();

  const [signingOut, setSigningOut] = React.useState(false);

  useOverlayLoaderState('sign_out', signingOut);

  const logOut = () => {
    const onConfirm = () => {
      setSigningOut(true);
      signOut();
      dataContext.sync({ name: 'authenticated_user', user: null });
    };
    Alert.alert(
      authCopy.CONFIRM_SIGN_OUT_TITLE,
      authCopy.CONFIRM_SIGN_OUT_MESSAGE,
      [
        {
          text: copy.ALERT_CANCEL,
          onPress: () => {},
          style: 'cancel'
        },
        { text: copy.ALERT_OK, onPress: () => onConfirm() }
      ],
      { cancelable: false }
    );
  };

  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h1">Profile</Typography>

        <Divider border={false} spacing={2} />

        <Button
          disabled={!networkState.isInternetReachable}
          color="secondary"
          variant="outlined"
          size="lg"
          onPress={() => logOut()}
        >Sign out</Button>

        {networkState.isInternetReachable ? null : (
          <Typography color="error" variant="caption">{authCopy.SIGN_OUT_OFFLINE_MESSAGE}</Typography>
        )}
      </View>
    </>
  );
};

export default Profile;

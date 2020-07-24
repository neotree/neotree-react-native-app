import React from 'react';
import PropTypes from 'prop-types';
import { View, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import authCopy from '@/constants/copy/auth';
import copy from '@/constants/copy';
import { useOverlayLoaderState, useAppContext } from '@/contexts/app';

const SignOutBtn = ({ icon, style, ...props }) => {
  const { signOut } = useAppContext();

  const [signingOut, setSigningOut] = React.useState(false);

  useOverlayLoaderState('sign_out', signingOut);

  const logOut = () => {
    const onConfirm = () => {
      setSigningOut(true);
      signOut()
        .catch(() => setSigningOut(false))
        .then(() => setSigningOut(false));
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
      <TouchableOpacity
        {...props}
        onPress={() => logOut()}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
          },
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        <>
          {!icon ? null : (
            <View style={[{ marginRight: 10 }]}>
              {icon}
            </View>
          )}
          <Text>Logout</Text>
        </>
      </TouchableOpacity>
    </>
  );
};

SignOutBtn.propTypes = {
  icon: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ])
};

export default SignOutBtn;

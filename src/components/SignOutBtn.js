import React from 'react';
import PropTypes from 'prop-types';
import { View, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import OverlayLoader from '@/components/OverlayLoader';
import { useAppContext } from '@/AppContext';

const SignOutBtn = ({ icon, style, ...props }) => {
  const { signOut } = useAppContext();
  const [signingOut, setSigningOut] = React.useState(false);

  const logOut = () => {
    const onConfirm = async () => {
      setSigningOut(true);
      try { await signOut(); } catch (e) { /*Do nothing*/ }
      setSigningOut(false);
    };

    Alert.alert(
      'Sign out',
      "Are you sure you want to sign out? You'll need internet connection to sign back in.",
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        { text: 'Ok', onPress: () => onConfirm() }
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

      <OverlayLoader display={signingOut} />
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

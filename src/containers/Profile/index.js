import React from 'react';
import { useHistory } from 'react-router-native';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import { signOut } from '@/api/auth';

const Profile = () => {
  const history = useHistory();

  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h1">Profile</Typography>
        <Divider />
        <Button
          color="disabled"
          variant="outlined"
          size="lg"
          onPress={() => signOut().then(() => {
            history.entries = [];
            history.push('/');
          })}
        >Sign out</Button>
      </View>
    </>
  );
};

export default Profile;

import React from 'react';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import { signOut } from '@/api/auth';

const Profile = () => {
  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h1">Profile</Typography>
        <Divider />
        <Button
          color="disabled"
          variant="outlined"
          size="lg"
          onPress={signOut}
        >Sign out</Button>
      </View>
    </>
  );
};

export default Profile;

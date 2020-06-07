import React from 'react';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import Logo from '@/components/Logo';
import constants from '@/constants/app';

const AppHeader = () => {
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Logo color="secondary" size={50} style={{ marginRight: 10 }} />
        <Typography
          variant="h1"
        >{constants.TITLE}</Typography>
      </View>
      <Divider />
    </>
  );
};

export default AppHeader;

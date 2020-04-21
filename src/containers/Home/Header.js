import React from 'react';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import Logo from '@/components/Logo';

const Header = () => {
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Logo color="secondary" size={50} style={{ marginRight: 10 }} />
        <Typography>NeoTree</Typography>
      </View>
    </>
  );
};

export default Header;

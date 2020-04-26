import React from 'react';
import { View } from 'react-native';
import { provideHomeContext } from '@/contexts/home';
import Scripts from './Scripts';

const Home = () => {
  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        <Scripts />
      </View>
    </>
  );
};

export default provideHomeContext(Home);

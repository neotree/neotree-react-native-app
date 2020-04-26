import React from 'react';
import { View } from 'react-native';
import { provideHomeContext } from '@/contexts/home';
import Header from './Header';
import Scripts from '../Scripts';

const Home = () => {
  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        <Header />
        <Scripts />
      </View>
    </>
  );
};

export default provideHomeContext(Home);

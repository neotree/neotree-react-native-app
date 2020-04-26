import React from 'react';
import { View } from 'react-native';
import { provideScriptsContext } from '@/contexts/scripts';
import List from './List';

const Scripts = () => {
  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        <List />
      </View>
    </>
  );
};

export default provideScriptsContext(Scripts);

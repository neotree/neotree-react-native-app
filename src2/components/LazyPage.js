import React from 'react';
import LazyComponent from '@/components/LazyComponent';
import { View } from 'react-native';
import { Spinner } from 'native-base';

const LoaderComponent = () => {
  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner color="blue" />
      </View>
    </>
  );
};

export default (load, opts) => LazyComponent(load, {
  LoaderComponent,
  ...opts
});

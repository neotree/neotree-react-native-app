import React from 'react';
import LazyComponent from '@/components/LazyComponent';
import { View } from 'react-native';
import ActivityIndicator from '@/ui/ActivityIndicator';

const LoaderComponent = () => {
  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    </>
  );
};

export default (load, opts) => LazyComponent(load, {
  LoaderComponent,
  ...opts
});

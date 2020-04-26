import React from 'react';
import PropTypes from 'prop-types';
import LazyComponent from '@/components/LazyComponent';
import { View } from 'react-native';
import useTheme from '@/ui/styles/useTheme';
import ActivityIndicator from '@/ui/ActivityIndicator';

const LoaderComponent = () => {
  const theme = useTheme();

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

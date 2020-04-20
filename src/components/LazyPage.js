import React from 'react';
import PropTypes from 'prop-types';
import LazyComponent from '@/components/LazyComponent';
import { View, ActivityIndicator } from 'react-native';
import useTheme from '@/ui/styles/useTheme';

const LoaderComponent = () => {
  const theme = useTheme();

  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator
          size="large"
          color={theme.palette.secondary}
        />
      </View>
    </>
  );
};

export default (load, opts) => LazyComponent(load, {
  LoaderComponent,
  ...opts
});

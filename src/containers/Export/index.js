import React from 'react';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import { provideExportDataContext } from '@/contexts/export-data';
import { Switch, Route } from 'react-router-native';
import LazyPage from '@/components/LazyPage';

const List = LazyPage(() => import('./List'));
const SingleView = LazyPage(() => import('./SingleView'));

const Export = () => {
  return (
    <>
      <View style={{ flex: 1 }}>
        <Switch>
          <Route exact path="/export/form/:formId" component={SingleView} />
          <Route component={List} />
        </Switch>
      </View>
    </>
  );
};

export default provideExportDataContext(Export);

import React from 'react';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import { provideFormsContext } from '@/contexts/forms';
import { Switch, Route } from 'react-router-native';
import LazyPage from '@/components/LazyPage';

const List = LazyPage(() => import('./List'));
const SingleView = LazyPage(() => import('./SingleView'));
const ExportPage = LazyPage(() => import('./ExportPage'));

const Forms = () => {
  return (
    <>
      <View style={{ flex: 1 }}>
        <Switch>
          <Route exact path="/forms/export" component={ExportPage} />
          <Route exact path="/forms/form/:formId" component={SingleView} />
          <Route component={List} />
        </Switch>
      </View>
    </>
  );
};

export default provideFormsContext(Forms);

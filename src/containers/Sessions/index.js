import React from 'react';
import { View } from 'react-native';
import { provideSessionsContext } from '@/contexts/sessions';
import { Switch, Route } from 'react-router-native';
import LazyPage from '@/components/LazyPage';

const List = LazyPage(() => import('./List'));
const SingleView = LazyPage(() => import('./SingleView'));
const ExportPage = LazyPage(() => import('./ExportPage'));

const Sessions = () => {
  return (
    <>
      <View style={{ flex: 1 }}>
        <Switch>
          <Route exact path="/sessions/export" component={ExportPage} />
          <Route exact path="/sessions/session/:sessionId" component={SingleView} />
          <Route component={List} />
        </Switch>
      </View>
    </>
  );
};

export default provideSessionsContext(Sessions);

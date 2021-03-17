import React from 'react';
import LazyPage from '@/components/LazyPage';
import { NativeRouter, BackButton, Switch, Route } from 'react-router-native';
import { useAppContext } from '@/AppContext';

const Authentication = LazyPage(() => import('./Authentication'));
const Location = LazyPage(() => import('./Location'));
const Home = LazyPage(() => import('@/containers/Home'));
const Sessions = LazyPage(() => import('@/containers/Sessions'));
const Script = LazyPage(() => import('@/containers/Script'));
const Configuration = LazyPage(() => import('@/containers/Configuration'));

function Containers() {
  const { state: { authenticatedUser, location } } = useAppContext();

  if (!authenticatedUser) return <Authentication />;

  if (!location) return <Location />;

  return (
    <>
      <NativeRouter>
        <BackButton>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/script/:scriptId" component={Script} />
            {/*<Route exact path="/script/:scriptId/preview-form" render={renderRouteComponent(Script)} />*/}
            {/*<Route exact path="/script/:scriptId/screen/:screenId" render={Script} />*/}
            <Route exact path="/configuration" component={Configuration} />
            <Route path="/sessions" component={Sessions} />
          </Switch>
        </BackButton>
      </NativeRouter>
    </>
  );
}

export default Containers;

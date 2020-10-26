import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-native';
import { useAppContext } from '../AppContext';

const Authentication = LazyPage(() => import('@/containers/Authentication'));
const Home = LazyPage(() => import('@/containers/Home'));
const Sessions = LazyPage(() => import('@/containers/Sessions'));
const Script = LazyPage(() => import('@/containers/Script'));
const Configuration = LazyPage(() => import('@/containers/Configuration'));

const Containers = () => {
  const { state: { authenticatedUser } } = useAppContext();

  const renderRouteComponent = (Component, opts = {}) => params => {
    const { isLoginPage } = opts;
    if (authenticatedUser && isLoginPage) return <Redirect to="/" />;
    if (!authenticatedUser && !isLoginPage) return <Redirect to="/sign-in" />;
    return <Component {...params} />;
  };

  return (
    <>
      <Switch>
        <Route exact path="/" render={renderRouteComponent(Home)} />
        <Route exact path="/sign-in" render={renderRouteComponent(Authentication, { isLoginPage: true, })} />
        <Route exact path="/script/:scriptId" render={renderRouteComponent(Script)} />
        <Route exact path="/script/:scriptId/preview-form" render={renderRouteComponent(Script)} />
        <Route exact path="/script/:scriptId/screen/:screenId" render={renderRouteComponent(Script)} />
        <Route exact path="/configuration" render={renderRouteComponent(Configuration)} />
        <Route path="/sessions" render={renderRouteComponent(Sessions)} />
      </Switch>
    </>
  );
};

export default Containers;

import React from 'react';
import PropTypes from 'prop-types';
import LazyPage from '@/components/LazyPage';
import NavMenu from '@/components/NavMenu';
import { Switch, Route } from "react-router-native";
import NetworkStatusBar from '@/components/NetworkStatusBar';

const Authentication = LazyPage(() => import('@/containers/Authentication'));
const Home = LazyPage(() => import('@/containers/Home'));
const Notifications = LazyPage(() => import('@/containers/Notifications'));
const Sessions = LazyPage(() => import('@/containers/Sessions'));
const Profile = LazyPage(() => import('@/containers/Profile'));
const Script = LazyPage(() => import('@/containers/Script'));
const Configuration = LazyPage(() => import('@/containers/Configuration'));

const Containers = () => {
  return (
    <>
      <NetworkStatusBar />

      <Switch>
        <Route exact path="/sign-in" component={Authentication} />
        <Route exact path="/script/:scriptId" component={Script} />
        <Route exact path="/script/:scriptId/preview-form" component={Script} />
        <Route exact path="/script/:scriptId/screen/:screenId" component={Script} />
        <Route exact path="/configuration" component={Configuration} />
        <Route path="/sessions" component={Sessions} />
        <Route render={() => (
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/notifications" component={Notifications} />
            <Route exact path="/profile" component={Profile} />
          </Switch>
        )} />
      </Switch>
    </>
  );
};

Containers.propTypes = {};

export default Containers;

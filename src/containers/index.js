import React from 'react';
import PropTypes from 'prop-types';
import LazyPage from '@/components/LazyPage';
import NavMenu from '@/components/NavMenu';
import { LayoutContainer, LayoutBody, LayoutNavigation } from '@/components/Layout';
import { Switch, Route } from "react-router-native";

const Authentication = LazyPage(() => import('@/containers/Authentication'));
const Home = LazyPage(() => import('@/containers/Home'));
const Notifications = LazyPage(() => import('@/containers/Notifications'));
const Export = LazyPage(() => import('@/containers/Export'));
const Profile = LazyPage(() => import('@/containers/Profile'));
const Script = LazyPage(() => import('@/containers/Script'));
const Debug = LazyPage(() => import('@/containers/Debug'));

const Containers = () => {
  return (
    <>
      <Switch>
        <Route exact path="/sign-in" component={Authentication} />
        <Route exact path="/script/:scriptId" component={Script} />
        <Route exact path="/script/:scriptId/screen/:screenId" component={Script} />
        <Route render={() => (
          <>
            <LayoutBody>
              <Route exact path="/" component={Home} />
              <Route exact path="/export" component={Export} />
              <Route exact path="/notifications" component={Notifications} />
              <Route exact path="/profile" component={Profile} />
              {process.env.NODE_ENV !== 'development' ? null : (
                <Route exact path="/debug" component={Debug} />
              )}
            </LayoutBody>

            <LayoutNavigation placement="bottom">
              <NavMenu />
            </LayoutNavigation>
          </>
        )} />
      </Switch>
    </>
  );
};

Containers.propTypes = {};

export default Containers;

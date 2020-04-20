import React from 'react';
import PropTypes from 'prop-types';
import LazyPage from '@/components/LazyPage';
import { LayoutContainer, LayoutBody, LayoutNavItem, LayoutNavigation } from '@/components/Layout';
import { Route, useHistory, useLocation } from "react-router-native";

const Home = LazyPage(() => import('@/containers/Home'));
const Notifications = LazyPage(() => import('@/containers/Notifications'));
const Export = LazyPage(() => import('@/containers/Export'));
const Profile = LazyPage(() => import('@/containers/Profile'));

const Containers = () => {
  const history = useHistory();
  const location = useLocation();

  const [active, setActive] = React.useState('home');

  const isLocationActive = path => location.pathname === path;

  return (
    <>
      <LayoutBody>
        <Route exact path="/" component={Home} />
        <Route exact path="/export" component={Export} />
        <Route exact path="/notifications" component={Notifications} />
        <Route exact path="/profile" component={Profile} />
      </LayoutBody>

      <LayoutNavigation placement="bottom">
        <LayoutNavItem
          active={isLocationActive('/')}
          onPress={() => history.push('/')}
          label="Homes"
          icon="md-home"
        />
        <LayoutNavItem
          active={isLocationActive('/export')}
          onPress={() => history.push('/export')}
          label="Export"
          icon="md-cloud-upload"
        />
        {/*<LayoutNavItem
          active={isLocationActive('/notifications')}
          onPress={() => history.push('/notifications')}
          color="primary"
          label="Notifications"
          icon="md-notifications"
        />*/}
        <LayoutNavItem
          active={isLocationActive('/profile')}
          onPress={() => history.push('/profile')}
          label="Profile"
          icon="md-person"
        />
      </LayoutNavigation>
    </>
  );
};

Containers.propTypes = {};

export default Containers;

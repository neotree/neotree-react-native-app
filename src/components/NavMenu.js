import React from 'react';
import { LayoutNavItem } from '@/components/Layout';
import { useHistory, useLocation } from "react-router-native";

const NavMenu = () => {
  const history = useHistory();
  const location = useLocation();

  const isLocationActive = path => location.pathname === path;

  return (
    <>
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
    </>
  );
};

export default NavMenu;

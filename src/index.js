import React from 'react';
import { onAuthStateChanged } from '@/api/auth';
import { provideDataContext } from '@/contexts/data';
import { useAppContext, provideAppContext } from '@/contexts/app';
import { useHistory } from 'react-router-native';

import { View, Text, StyleSheet } from 'react-native';
import { LayoutContainer } from '@/components/Layout';
import LazyPage from '@/components/LazyPage';
import Splash from '@/components/Splash';

const Authentication = LazyPage(() => import('@/containers/Authentication'), { LoaderComponent: Splash });
const Containers = LazyPage(() => import('@/containers'), { LoaderComponent: Splash });

const NeoTreeApp = (props) => {
  const history = useHistory();

  const {
    setState,
    appIsReady,
    state: { authenticatedUser, authenticatedUserInitialised }
  } = useAppContext();

  React.useEffect(() => {
    onAuthStateChanged(u => {
      setState({
        authenticatedUser: u,
        authenticatedUserInitialised: true,
      });
      if (!authenticatedUser && u) history.push('/');
    });
  }, []);

  return (
    <>
      <View style={{ flex: 1 }}>
        {(() => {
          if (!appIsReady()) {
            return <Splash />
          }

          if (!authenticatedUser) {
            return <Authentication />;
          }

          return (
            <LayoutContainer>
              <Containers />
            </LayoutContainer>
          );
        })()}
      </View>
    </>
  );
};

export default provideDataContext(
  provideAppContext(NeoTreeApp)
);

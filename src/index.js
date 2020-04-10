import React from 'react';
import { provideAppContext } from '@/contexts/app/Provider';
import { onAuthStateChanged } from '@/api/auth';
import { useAppContext } from '@/contexts/app';
import { useHistory } from 'react-router-native';

import { View, Text, StyleSheet } from 'react-native';
import { LayoutContainer } from '@/components/Layout';
import LazyComponent from '@/components/LazyComponent';
import Splash from '@/components/Splash';

const Authentication = LazyComponent(() => import('@/containers/Authentication'), { LoaderComponent: Splash });
const Containers = LazyComponent(() => import('@/containers'), { LoaderComponent: Splash });

const NeoTreeApp = (props) => {
  const history = useHistory();

  const { setState, state: { authenticatedUser, authenticatedUserInitialised } } = useAppContext();

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
          if (!authenticatedUserInitialised) {
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

export default provideAppContext(NeoTreeApp);

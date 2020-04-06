import React from 'react';
import { provideAppContext } from '@/contexts/app/Provider';
import { onAuthStateChanged } from '@/api/auth';
import { useAppContext } from '@/contexts/app';

import { View, Text, StyleSheet } from 'react-native';
import ThemeProvider from '@/ui/styles/ThemeProvider';
import LazyComponent from '@/components/LazyComponent';
import Splash from '@/components/Splash';

const Authentication = LazyComponent(() => import('@/containers/Authentication'));
const Home = LazyComponent(() => import('@/containers/Home'));

const NeoTreeApp = () => {
  const { setState, state: { authenticatedUser, authenticatedUserInitialised } } = useAppContext();

  React.useEffect(() => {
    onAuthStateChanged(u => setState({
      authenticatedUser: u,
      authenticatedUserInitialised: true,
    }));
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

          return <Home />;
        })()}
      </View>
    </>
  );
};

export default provideAppContext(NeoTreeApp);

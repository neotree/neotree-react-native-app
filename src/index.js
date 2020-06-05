import React from 'react';
import { provideDataContext } from '@/contexts/data';
import { useAppContext, provideAppContext } from '@/contexts/app';

import { View } from 'react-native';
import { LayoutContainer } from '@/components/Layout';
import LazyPage from '@/components/LazyPage';
import Splash from '@/components/Splash';

const Authentication = LazyPage(() => import('@/containers/Authentication'), { LoaderComponent: Splash });
const Containers = LazyPage(() => import('@/containers'), { LoaderComponent: Splash });

const NeoTreeApp = () => {
  const {
    appIsReady,
    state: { authenticatedUser, authenticatedUserInitialised }
  } = useAppContext();

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

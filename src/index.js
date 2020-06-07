import React from 'react';
import { provideDataContext } from '@/contexts/data';
import { provideNetworkContext } from '@/contexts/network';
import { useAppContext, provideAppContext } from '@/contexts/app';
import { useHistory } from 'react-router-native';
import Overlay from '@/ui/Overlay';

import { View } from 'react-native';
import { LayoutContainer } from '@/components/Layout';
import LazyPage from '@/components/LazyPage';
import Splash from '@/components/Splash';
import OverlayLoader from '@/components/OverlayLoader';

const Authentication = LazyPage(() => import('@/containers/Authentication'), { LoaderComponent: Splash });
const Containers = LazyPage(() => import('@/containers'), { LoaderComponent: Splash });

const NeoTreeApp = () => {
  const history = useHistory();

  const {
    isAppReady,
    authenticatedUser,
    displayOverlayLoader,
  } = useAppContext();

  const appIsReady = isAppReady();

  React.useEffect(() => {
    if (appIsReady) {
      history.entries = [];
      history.push(authenticatedUser ? '/' : '/sign-in');
    }
  }, [authenticatedUser, appIsReady]);

  if (!appIsReady) {
    return (
      <Overlay>
        <Splash />
      </Overlay>
    );
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <LayoutContainer>
          <Containers />
        </LayoutContainer>

        <OverlayLoader display={displayOverlayLoader()} />
      </View>
    </>
  );
};

export default provideNetworkContext(
  provideDataContext(
    provideAppContext(NeoTreeApp)
  )
);

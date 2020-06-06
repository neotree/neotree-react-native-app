import React from 'react';
import { provideDataContext } from '@/contexts/data';
import { provideNetworkContext } from '@/contexts/network';
import { useAppContext, provideAppContext } from '@/contexts/app';
import { useHistory } from 'react-router-native';

import { View } from 'react-native';
import { LayoutContainer } from '@/components/Layout';
import LazyPage from '@/components/LazyPage';
import Splash from '@/components/Splash';
import OverlayLoader from '@/components/OverlayLoader';

const Authentication = LazyPage(() => import('@/containers/Authentication'), { LoaderComponent: Splash });
const Containers = LazyPage(() => import('@/containers'), { LoaderComponent: Splash });

const NeoTreeApp = () => {
  const history = useHistory();

  const { appIsReady, state: { displayOverlayLoader, authenticatedUser } } = useAppContext();

  React.useEffect(() => {
    if (appIsReady()) {
      history.entries = [];
      history.push(authenticatedUser ? '/' : '/sign-in');
    }
  }, [authenticatedUser]);

  return (
    <>
      <View style={{ flex: 1 }}>
        {(() => {
          if (!appIsReady()) return <Splash />;

          return (
            <LayoutContainer>
              <Containers />
            </LayoutContainer>
          );
        })()}
        <OverlayLoader display={displayOverlayLoader} />
      </View>
    </>
  );
};

export default provideNetworkContext(
  provideDataContext(
    provideAppContext(NeoTreeApp)
  )
);

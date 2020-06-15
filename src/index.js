import React from 'react';
import { provideDataContext } from '@/contexts/data';
import { provideNetworkContext } from '@/contexts/network';
import { useAppContext, provideAppContext } from '@/contexts/app';
import { useHistory } from 'react-router-native';
import Overlay from '@/ui/Overlay';
// import Debug from '@/components/Debug';
import { Container, StyleProvider } from 'native-base';
import getTheme from '@/native-base-theme/components';
import material from '@/native-base-theme/variables/material';
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
    appIsReady,
    splashScreen,
    authenticatedUser,
    displayOverlayLoader,
  } = useAppContext();

  React.useEffect(() => {
    if (appIsReady) {
      history.entries = [];
      history.push(authenticatedUser ? '/' : '/sign-in');
    }
  }, [authenticatedUser, appIsReady]);

  if (splashScreen.display) {
    return (
      <Overlay>
        <Splash>{splashScreen.text}</Splash>
      </Overlay>
    );
  }

  return (
    <>
      <StyleProvider style={getTheme(material)}>
        <Container>
          <View style={{ flex: 1 }}>
            <LayoutContainer>
              <Containers />
            </LayoutContainer>

            <OverlayLoader display={displayOverlayLoader()} />
          </View>

          {/*<Debug />*/}
        </Container>
      </StyleProvider>
    </>
  );
};

export default provideNetworkContext(
  provideDataContext(
    provideAppContext(NeoTreeApp)
  )
);

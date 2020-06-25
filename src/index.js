import React from 'react';
import { provideDataContext } from '@/contexts/data';
import { provideNetworkContext } from '@/contexts/network';
import { useAppContext, provideAppContext } from '@/contexts/app';
import { useHistory } from 'react-router-native';
import Overlay from '@/components/Overlay';
// import Debug from '@/components/Debug';
import { Container, StyleProvider, Root } from 'native-base';
import getTheme from '@/native-base-theme/components';
import material from '@/native-base-theme/variables/material';
import { View } from 'react-native';
import LazyPage from '@/components/LazyPage';
import Splash from '@/components/Splash';
import OverlayLoader from '@/components/OverlayLoader';
import NetworkStatusBar from '@/components/NetworkStatusBar';

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
        <Splash text={splashScreen.text} />
      </Overlay>
    );
  }

  return (
    <>
      <Root>
        <StyleProvider style={getTheme(material)}>
          <Container>
            <>
              <View style={{ flex: 1 }}>
                <Containers />
              </View>
              <NetworkStatusBar />
              <OverlayLoader display={displayOverlayLoader()} />
            </>

            {/*<Debug />*/}
          </Container>
        </StyleProvider>
      </Root>
    </>
  );
};

export default provideNetworkContext(
  provideDataContext(
    provideAppContext(NeoTreeApp)
  )
);

import React from 'react';
import { useAppContext, provideAppContext } from '@/contexts/app';
import { Container, StyleProvider, Root } from 'native-base';
import getTheme from '@/native-base-theme/components';
import material from '@/native-base-theme/variables/commonColor';
import { View } from 'react-native';
import LazyPage from '@/components/LazyPage';
import Splash from '@/components/Splash';
import OverlayLoader from '@/components/OverlayLoader';
import NetworkStatusBar from '@/components/NetworkStatusBar';

const Containers = LazyPage(() => import('@/containers'), { LoaderComponent: Splash });

const NeoTreeApp = () => {
  const {
    getSplashScreenInfo,
    displayOverlayLoader,
    state: { appInitialised, },
  } = useAppContext();

  const splashScreen = getSplashScreenInfo();

  return (
    <View style={{ flex: 1 }}>
      {!!appInitialised && (
        <Root>
          <Container>
            <StyleProvider style={getTheme(material)}>
              <>
                <View style={{ flex: 1 }}>
                  <Containers />
                </View>
                <NetworkStatusBar />
                <OverlayLoader display={displayOverlayLoader()} />
              </>
            </StyleProvider>
          </Container>
        </Root>
      )}
      
      {!!splashScreen.display && <Splash text={splashScreen.text} />}
    </View>
  );
};

export default provideAppContext(NeoTreeApp);

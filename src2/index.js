import React from 'react';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { View, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { Container, StyleProvider, Root } from 'native-base';
import getTheme from './native-base-theme/components';
import material from './native-base-theme/variables/commonColor';
import LazyPage from './components/LazyPage';
import Splash from './components/Splash';
import NetworkStatusBar from './components/NetworkStatusBar';
import * as api from './api';
import AppContext from './AppContext';
import addSocketEventsListeners from './_addSocketEventsListeners';

const Containers = LazyPage(() => import('./containers'), { LoaderComponent: Splash });

const NeoTreeApp = () => {
  const [state, _setState] = React.useState({
    errors: [],
    fontsLoaded: false,
    authenticatedUser: null,
    deviceRegistration: null,
    appIsReady: false,
    lastSocketEvent: null,
  });
  const setState = partialState => _setState(prev => ({
    ...prev,
    ...(typeof partialState === 'function' ? partialState(prev) : partialState),
  }));

  const sync = opts => new Promise((resolve, reject) => {
    (async () => {
      try {
        const syncRslts = await api.sync(opts);
        setState(syncRslts);
        resolve(syncRslts)
      } catch (e) { reject(e); }
    })();
  });

  const alertError = React.useCallback((errType, e) => {
    Alert.alert(
      'ERROR',
      `${errType}: ${e.message || e.msg || JSON.stringify(e)}`,
      [
        {
          text: 'Exit app',
          type: 'cancel',
          onPress: () => BackHandler.exitApp(),
        }
      ]
    );
  }, []);

  React.useEffect(() => {
    addSocketEventsListeners(async e => {
      try { await sync(); } catch (e) { /* Do nothing */ }
      setState({ lastSocketEvent: e });
    });

    (async () => {
      try {
        await Font.loadAsync({
          Roboto: require('native-base/Fonts/Roboto.ttf'),
          Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
          ...Ionicons.font,
        });
        setState({ fontsLoaded: true, });
      } catch (e) { return alertError('Load fonts error', e); }
    })();
  }, []);

  const { appIsReady, switchingMode, application } = state;

  React.useEffect(() => {
    if (!appIsReady) {
      (async () => {
        try {
          const initDataRslts = await api.initialiseAppData();
          if (initDataRslts.dataInitialised) await sync();
          setState({ ...initDataRslts, appIsReady: true });
        } catch (e) { alertError('Sync error', e); }
      })();
    }
  }, [appIsReady]);

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        sync,
        switchMode: mode => new Promise((resolve, reject) => {
          if (application.mode === mode) return resolve({ success: true });
          (async () => {
            setState({ switchingMode: mode });
            try {
              await sync({ mode });
              resolve({ success: true });
            } catch (e) { reject(e); }
            setState({ switchingMode: null });
          })();
        })
      }}
    >
      {switchingMode || !appIsReady ? (
        <Splash
          text={switchingMode ?
            `${switchingMode === 'development' ? 'Entering' : 'Leaving'} development mode, this may take a while...`
            :
            'Syncing data, this may take a while...'}
        >
          <ActivityIndicator size={25} color="#999" />
        </Splash>
      ) : (
        <View style={{ flex: 1 }}>
          <Root>
            <Container>
              <StyleProvider style={getTheme(material)}>
                <>
                  <Containers />
                  <NetworkStatusBar />
                </>
              </StyleProvider>
            </Container>
          </Root>
        </View>
      )}
    </AppContext.Provider>
  );
};

export default NeoTreeApp;

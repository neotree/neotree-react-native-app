import React from 'react';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { View, Alert, BackHandler, } from 'react-native';
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
  const appDataRef = React.useRef(new api.AppData());

  const [state, _setState] = React.useState({
    errors: [],
    fontsLoaded: false,
    authenticatedUser: null,
    dataStatus: null,
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
        const syncRslts = await appDataRef.current.sync(opts);
        setState(syncRslts);
        resolve(syncRslts)
      } catch (e) { reject(e); }
    })();
  });

  const signOut = () => new Promise((resolve, reject) => {
    (async () => {
      try { await api.signOut(); } catch (e) { return reject(e); }
      resolve();
      setState({ authenticatedUser: null });
    })();
  });

  React.useEffect(() => {
    addSocketEventsListeners(async e => {
      try { await sync(); } catch (e) { /* Do nothing */ }
      setState({ lastSocketEvent: e });
    });

    (async () => {
      const alertError = (errType, e) => {
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
      };

      try {
        await Font.loadAsync({
          Roboto: require('native-base/Fonts/Roboto.ttf'),
          Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
          ...Ionicons.font,
        });
        setState({ fontsLoaded: true, });
      } catch (e) { return alertError('Load fonts error', e); }

      try {
        const initDataRslts = await appDataRef.current.initlialise();
        setState(initDataRslts);

        await sync();
      } catch (e) {
        return alertError('Sync error', e);
      }

      setState({ appIsReady: true });
    })();
  }, []);

  const { appIsReady, switchingMode, application } = state;

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        sync,
        signOut,
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
          text={switchingMode ? `Changing to ${switchingMode} mode, this may take a while...` : 'Syncing data, this may take a while...'}
        />
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

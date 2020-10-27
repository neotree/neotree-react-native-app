import React from 'react';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import * as Application from 'expo-application';
import { Container, StyleProvider, Root } from 'native-base';
import NetInfo from '@react-native-community/netinfo';
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
        const dataState = await api.sync(opts);
        setState({ ...dataState });
        resolve(dataState)
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
      try { await sync({ socketEvent: e }); } catch (e) { /* Do nothing */ }
      setState({ lastSocketEvent: e });
    });

    (async () => {
      const setError = (errType, e) => {
        console.log(errType, e);
        setState(({ errors }) => ({
          errors: [...errors, `${errType}: ${e.message || e.msg || JSON.stringify(e)}`]
        }));
      };

      let neworkState = null;
      try { neworkState = await NetInfo.fetch(); } catch (e) { return setError('Get network state', e); }

      let deviceId = null;
      try {
        deviceId = await new Promise((resolve, reject) => {
          if (Platform.OS === 'android') return resolve(Application.androidId);
          Application.getIosIdForVendorAsync()
            .then(uid => resolve(uid))
            .catch(reject);
        });
      } catch (e) { setError('Load device id', e); }

      try {
        await Font.loadAsync({
          Roboto: require('native-base/Fonts/Roboto.ttf'),
          Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
          ...Ionicons.font,
        });
        setState({ fontsLoaded: true, });
      } catch (e) { setError('Load fonts error', e); }

      let deviceRegistration = null;
      if (neworkState && neworkState.isInternetReachable) {
        try {
          deviceRegistration = await api.webeditor.getDeviceRegistration({ deviceId });
          deviceRegistration = deviceRegistration.device;
          setState({ deviceRegistration });
        } catch (e) {
          setError('Get device registration error', e);
        }
      }

      try { await sync({ deviceRegistration }); } catch (e) { setError('Sync error', e); }

      setState({ appIsReady: true });
    })();
  }, []);

  const { appIsReady } = state;

  return (
    <AppContext.Provider
      value={{ state, setState, sync, signOut, }}
    >
      {!appIsReady ? <Splash text="Syncing data, this may take a while..." /> : (
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

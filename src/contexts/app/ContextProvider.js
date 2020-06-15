import React from 'react';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import copy from '@/constants/copy';
import Context from './Context';
import { useDataContext } from '../data';

function Provider(props) {
  const {
    dataIsReady,
    fontsLoaded,
    state: {
      syncingData,
      authenticatedUser,
      authenticatedUserInitialised
    }
  } = useDataContext();

  const [state, _setState] = React.useState({
    displaySplashScreen: false,
    splashScreenText: null,
    overlayLoaderState: {},
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  React.useEffect(() => {
    Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    })
      .then(() => setState({ fontsLoaded: true }))
      .catch(() => setState({ fontsLoaded: true }));
  }, []);

  const displayOverlayLoader = () => Object.keys(state.overlayLoaderState).reduce((acc, key) => {
    if (state.overlayLoaderState[key]) acc = true;
    return acc;
  }, false);

  const isAppReady = () => state.fontsLoaded && dataIsReady;

  const getSplashScreenInfo = () => {
    const text = syncingData ? copy.SYNCING_DATA_TEXT : '';
    return {
      display: !isAppReady() || state.displaySplashScreen,
      text: fontsLoaded ? state.splashScreenText || text : null
    };
  };

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        displayOverlayLoader,
        authenticatedUser,
        authenticatedUserInitialised,
        appIsReady: isAppReady(),
        splashScreen: getSplashScreenInfo(),
      }}
    />
  );
}

export default Provider;

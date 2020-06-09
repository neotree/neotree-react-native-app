import React from 'react';
import copy from '@/constants/copy';
import Context from './Context';
import { useDataContext } from '../data';

function Provider(props) {
  const {
    isDataReady,
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

  const displayOverlayLoader = () => Object.keys(state.overlayLoaderState).reduce((acc, key) => {
    if (state.overlayLoaderState[key]) acc = true;
    return acc;
  }, false);

  const isAppReady = () => isDataReady();

  const getSplashScreenInfo = () => {
    const text = syncingData ? copy.SYNCING_DATA_TEXT : '';
    return {
      display: !isAppReady() || state.displaySplashScreen,
      text: state.splashScreenText || text
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

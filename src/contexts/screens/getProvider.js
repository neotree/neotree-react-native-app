import React from 'react';
import { BackHandler, Platform } from 'react-native';
import useRouter from '@/utils/useRouter';

import _canGoToNextScreen from './_canGoToNextScreen';
import _canGoToPrevScreen from './_canGoToPrevScreen';
import _getScreens from './_getScreens';
import _goToScreen from './_goToScreen';
import _setActiveScreen from './_setActiveScreen';
import _goToNextScreen from './_goToNextScreen';
import _goToPrevScreen from './_goToPrevScreen';

export default Context => {
  return props => {
    const router = useRouter();
    const { scriptId, screenId } = router.match.params;

    const [state, _setState] = React.useState({
      activeScreen: null,
      screenId,
      screens: [],
      activeScreenIndex: null,
      loadingScreens: false,
      loadScreensError: null,
      screensInitialised: false,
    });

    const setState = s => _setState(
      typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
    );

    const canGoToNextScreen = _canGoToNextScreen({ state, setState, router });
    const canGoToPrevScreen = _canGoToPrevScreen({ state, setState, router });
    const getScreens = _getScreens({ state, setState, router });
    const setActiveScreen = _setActiveScreen({ state, setState, router });
    const goToScreen = _goToScreen({ state, setState, router, setActiveScreen });
    const goToNextScreen = _goToNextScreen({ state, setState, router, goToScreen, canGoToNextScreen });
    const goToPrevScreen = _goToPrevScreen({ state, setState, router, goToScreen, canGoToPrevScreen });

    const initialisePage = (opts = {}) => {
      if (opts.force || !state.screensInitialised) {
        getScreens();
      }
    };

    React.useEffect(() => {
      let backHandler = null;

      if (Platform.OS === 'android') {
        backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => setActiveScreen(state.activeScreenIndex - 1)
        );
      }

      return () => {
        if (backHandler) backHandler.remove();
      };
    });

    React.useEffect(() => { initialisePage(); }, [scriptId]);

    return (
      <Context.Provider
        {...props}
        value={{
          state,
          setState,
          initialisePage,
          canGoToNextScreen,
          canGoToPrevScreen,
          goToScreen,
          goToNextScreen,
          goToPrevScreen,
          getScreens
        }}
      />
    );
  };
};

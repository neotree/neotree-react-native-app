import React from 'react';
import { getScreens } from '@/api/screens';
import { useParams, useHistory } from 'react-router-native';
import { BackHandler, Platform } from 'react-native';

export default Context => {
  return props => {
    const history = useHistory();
    const { scriptId, screenId } = useParams();

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

    const { screens, activeScreenIndex } = state;

    const canGoToNextScreen = () => {
      return activeScreenIndex < (screens.length - 1);
    };

    const canGoToPrevScreen = () => {
      return activeScreenIndex > 0;
    };

    const setActiveScreen = (i = 0, cb) => {
      const activeScreenIndex = i < 0 ? 0 : i > (screens.length - 1) ? (screens.length - 1) : i || 0;
      const activeScreen = screens[activeScreenIndex];
      setState({ activeScreen, activeScreenIndex });
      if (cb) cb(activeScreen);
    };

    const goToScreen = (i = 0) => setActiveScreen(i, activeScreen => {
      if (activeScreen) {
        history.push(`/script/${scriptId}${activeScreenIndex === 0 ? '' : `/screen/${activeScreen.id}`}`);
      }
    });

    const _getScreens = () => {
      setState({ loadScreensError: null, loadingScreens: true });
      getScreens({ payload: { script_id: scriptId } })
        .then(payload => {
          const _activeScreenIndex = 0;
          setState({
            screens: payload.screens || [],
            screensInitialised: true,
            loadScreensError: payload.error,
            loadingScreens: false,
            activeScreen: payload.screens[_activeScreenIndex],
            activeScreenIndex: _activeScreenIndex
          });
        })
        .catch(e => setState({
          loadScreensError: e,
          screensInitialised: true,
          loadingScreens: false,
        }));
    };

    const initialisePage = (opts = {}) => {
      if (opts.force || !state.screensInitialised) {
        _getScreens();
      }
    };

    React.useEffect(() => {
      let backHandler = null;

      if (Platform.OS === 'android') {
        backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => setActiveScreen(activeScreenIndex - 1)
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
          goToNextScreen: () => canGoToNextScreen() && goToScreen(activeScreenIndex + 1),
          goToPrevScreen: () => canGoToPrevScreen() && goToScreen(activeScreenIndex - 1),
          getScreens: _getScreens
        }}
      />
    );
  };
};

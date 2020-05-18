import React from 'react';
import { BackHandler, Platform } from 'react-native';
import useRouter from '@/utils/useRouter';
import { useScriptContext } from '@/contexts/script';
import Context from './Context';

import _canGoToNextScreen from './_canGoToNextScreen';
import _canGoToPrevScreen from './_canGoToPrevScreen';
import _getScreens from './_getScreens';
import _goToScreen from './_goToScreen';
import _setActiveScreen from './_setActiveScreen';
import _goToNextScreen from './_goToNextScreen';
import _goToPrevScreen from './_goToPrevScreen';

export default function Provider(props) {
  const scriptContext = useScriptContext();

  const router = useRouter();
  const { scriptId, screenId } = router.match.params;

  const [state, _setState] = React.useState({
    form: {},
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

  const setForm = s => _setState(prevState => ({
    ...prevState,
    form: { ...prevState.form, ...typeof s === 'function' ? s(prevState.form) : s }
  }));

  const canGoToNextScreen = _canGoToNextScreen({ state, setState, router, scriptContext });
  const canGoToPrevScreen = _canGoToPrevScreen({ state, setState, router, scriptContext });
  const getScreens = _getScreens({ state, setState, router, scriptContext });
  const setActiveScreen = _setActiveScreen({ state, setState, router, scriptContext });
  const goToScreen = _goToScreen({ state, setState, router, setActiveScreen, scriptContext });
  const goToNextScreen = _goToNextScreen({ state, setState, router, goToScreen, canGoToNextScreen, scriptContext });
  const goToPrevScreen = _goToPrevScreen({ state, setState, router, goToScreen, canGoToPrevScreen, scriptContext });

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
        setForm,
        scriptContext,
        initialisePage,
        canGoToNextScreen,
        canGoToPrevScreen,
        goToScreen,
        goToNextScreen,
        goToPrevScreen,
        getScreens,
      }}
    />
  );
}

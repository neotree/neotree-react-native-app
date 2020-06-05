import React from 'react';
import useRouter from '@/utils/useRouter';
// import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import Context from './Context';

import _canGoToNextScreen from './_canGoToNextScreen';
import _canGoToPrevScreen from './_canGoToPrevScreen';
import _getScreens from './_getScreens';
import _goToScreen from './_goToScreen';
import _goToNextScreen from './_goToNextScreen';
import _goToPrevScreen from './_goToPrevScreen';
import _parseScreenCondition from './_parseScreenCondition';

export default function Provider(props) {
  const router = useRouter();
  const { location } = router;
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
    activeScreenInitialised: false,
  });

  const { screensInitialised, screens } = state;

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const setForm = s => _setState(prevState => ({
    ...prevState,
    form: { ...prevState.form, ...typeof s === 'function' ? s(prevState.form) : s }
  }));

  const parseScreenCondition = _parseScreenCondition({ state });
  const canGoToNextScreen = _canGoToNextScreen({ state, setState, router });
  const canGoToPrevScreen = _canGoToPrevScreen({ state, setState, router });
  const getScreens = _getScreens({ state, setState, router });
  const goToScreen = _goToScreen({ state, setState, router, parseScreenCondition });
  const goToNextScreen = _goToNextScreen({ state, setState, router, goToScreen, canGoToNextScreen });
  const goToPrevScreen = _goToPrevScreen({ state, setState, router, goToScreen, canGoToPrevScreen });

  const initialisePage = (opts = {}) => {
    if (opts.force || !state.screensInitialised) {
      getScreens();
    }
  };

  // useDataRefresherAfterSync('screens', ({ event }) => {
  //   const shouldGetScreens = event.screens.reduce((acc, s) => {
  //     if (state.screens.map(s => s.id).indexOf(s.id) > -1) acc = true;
  //     return acc;
  //   }, false);
  //
  //   if (shouldGetScreens) getScreens(null, { showLoader: false });
  // });

  React.useEffect(() => {
    if (screensInitialised) {
      const activeScreenIndex = screenId ? screens.map(s => s.id.toString()).indexOf(screenId) : 0;
      const activeScreen = screens[activeScreenIndex];
      setState({ activeScreenIndex, activeScreen, activeScreenInitialised: true });
    }
  }, [screensInitialised, location]);

  React.useEffect(() => { initialisePage(); }, [scriptId]);

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        setForm,
        initialisePage,
        canGoToNextScreen,
        canGoToPrevScreen,
        goToScreen,
        goToNextScreen,
        goToPrevScreen,
        getScreens,
        parseScreenCondition
      }}
    />
  );
}

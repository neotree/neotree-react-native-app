import React from 'react';
import PropTypes from 'prop-types';
import useRouter from '@/utils/useRouter';
import { useScriptContext } from '@/contexts/script';
// import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import Context from './Context';

import _canGoToNextScreen from './_canGoToNextScreen';
import _canGoToPrevScreen from './_canGoToPrevScreen';
import _getScreens from './_getScreens';
import _goToScreen from './_goToScreen';
import _goToNextScreen from './_goToNextScreen';
import _goToPrevScreen from './_goToPrevScreen';
import { parseCondition, sanitizeCondition } from './_parseScreenCondition';
import _getLastScreen from './_getLastScreen';
import _canSave from './_canSave';
import _saveForm from './_saveForm';

export default function Provider({ children }) {
  const router = useRouter();
  const { location } = router;
  const { scriptId, screenId } = router.match.params;

  const { state: { script } } = useScriptContext();

  const [state, _setState] = React.useState({
    start_time: new Date().toString(),
    form: [],
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

  const parseScreenCondition = parseCondition({ state });
  const getLastScreen = _getLastScreen({ state, setState, parseScreenCondition, sanitizeCondition, });
  const isLastScreen = () => state.activeScreen && (state.activeScreen.id === getLastScreen().id);
  const canSave = _canSave({ state, setState, isLastScreen });
  const canGoToNextScreen = _canGoToNextScreen({ state, setState, isLastScreen });
  const canGoToPrevScreen = _canGoToPrevScreen({ state, setState, router });
  const getScreens = _getScreens({ state, setState, router });
  const goToScreen = _goToScreen({ state, setState, router, parseScreenCondition, sanitizeCondition, });
  const goToNextScreen = _goToNextScreen({ state, setState, router, goToScreen, canGoToNextScreen });
  const goToPrevScreen = _goToPrevScreen({ state, setState, router, goToScreen, canGoToPrevScreen });

  const saveForm = _saveForm({ state, setState, script, router });

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
      setState({
        activeScreenIndex,
        activeScreenInitialised: true,
        activeScreen: !activeScreen ? null : {
          ...activeScreen,
          data: {
            ...activeScreen.data,
            metadata: {
              ...activeScreen.data.metadata,
              ...(activeScreen.data.metadata || {}).items ?
                { items: activeScreen.data.metadata.items.sort((a, b) => a.position - b.position) }
                :
                null,
              ...(activeScreen.data.metadata || {}).fields ?
                { fields: activeScreen.data.metadata.fields.sort((a, b) => a.position - b.position) }
                :
                null
            }
          }
        },
      });
    }
  }, [screensInitialised, location]);

  React.useEffect(() => { initialisePage(); }, [scriptId]);

  return (
    <Context.Provider
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
        parseScreenCondition,
        sanitizeCondition,
        getLastScreen,
        isLastScreen,
        canSave,
        saveForm,
      }}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};

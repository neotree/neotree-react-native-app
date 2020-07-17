import React from 'react';
import PropTypes from 'prop-types';
import useRouter from '@/utils/useRouter';
import { useScriptContext } from '@/contexts/script';
import { useDiagnosesContext } from '@/contexts/diagnoses';
// import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import Context from './Context';

import _getScreens from './_getScreens';
import _parseScreenCondition from './_parseScreenCondition';
import _canSave from './_canSave';
import _saveForm from './_saveForm';
import _getConfiguration from './_getConfiguration';
import _screenNavigation from './screenNavigation';

export default function Provider({ children }) {
  const router = useRouter();
  const { location } = router;
  const { scriptId, screenId } = router.match.params;

  const { state: { script } } = useScriptContext();
  const { state: { diagnoses } } = useDiagnosesContext();

  const [state, _setState] = React.useState({
    start_time: new Date().toString(),
    form: [],
    configuration: {},
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
  const screenNavigation = _screenNavigation({ state, setState, router, parseScreenCondition });
  const canSave = _canSave({ state, setState, ...screenNavigation  });
  const getScreens = _getScreens({ state, setState, router });
  const getConfiguration = _getConfiguration({ state, setState, router });

  const saveForm = _saveForm({ diagnoses, state, setState, script, router });

  const initialisePage = () => {
    getScreens();
    getConfiguration();
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
        ...screenNavigation,
        getScreens,
        parseScreenCondition,
        canSave,
        saveForm,
      }}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};

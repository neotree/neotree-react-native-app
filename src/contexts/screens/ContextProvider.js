import React from 'react';
import PropTypes from 'prop-types';
import useRouter from '@/utils/useRouter';
import { useScriptContext } from '@/contexts/script';
import { useDiagnosesContext } from '@/contexts/diagnoses';
import { Button, Text } from 'native-base';
// import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import Context from './Context';
import ContextValue from './ContextValue';

export default function Provider({ children }) {
  const router = useRouter();
  const { location } = router;
  const { scriptId, screenId } = router.match.params;

  const { state: { script } } = useScriptContext();
  const { state: { diagnoses } } = useDiagnosesContext();

  const [state, setState] = React.useState({
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
  const contextValue = new ContextValue({
    state, 
    setState, 
    router,  
    diagnoses,
    script,
  });

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
      contextValue.setState({
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

  React.useEffect(() => { contextValue.initialisePage(); }, [scriptId]);

  return (
    <Context.Provider
      value={contextValue}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};

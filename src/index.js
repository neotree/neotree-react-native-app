import React from 'react';
import { ActivityIndicator } from 'react-native';
import DisplayError from '@/components/DisplayError';
import Splash from '@/components/Splash';
import * as api from './api';
import Containers from './containers';
import AppContext from './AppContext';
import addSocketEventsListeners from './_addSocketEventsListeners';

const defaultAppState = {
  fatalError: null,
  initialisingApp: false,
  authenticatedUser: null,
  location: null,
  application: null,
};

function NeotreeApp() {
  const [state, _setState] = React.useState(defaultAppState);
  const setState = s => _setState(prev => ({ ...prev, ...(typeof s === 'function' ? s(prev) : s) }));

  /*
  * initialiseDatabase: creates database if not exists
  */
  const initialiseApp = React.useCallback(() => {
    (async () => {
      setState({ ...defaultAppState, initialisingApp: true, });
      try {
        await api.initialiseDatabase();
        const authenticatedUser = await api.getAuthenticatedUser();
        const location = await api.getLocation();
        let application = null;
        if (location && authenticatedUser) {
          try { await api.sync(); } catch (e) { /**/ }
          application = await api.getApplication();
        }
        setState({ authenticatedUser, location, application });
      } catch (e) { setState({ fatalError: e.message }); }
      setState({ initialisingApp: false });
    })();
  }, []);

  React.useEffect(() => { initialiseApp(); }, []);

  const { fatalError, initialisingApp, location } = state;

  React.useEffect(() => {
    (async () => {
      if (location) {
        try {
          await api.connectSocket(location);
          addSocketEventsListeners(async e => {
            try { await api.sync(); } catch (e) { /* Do nothing */ }
            setState({ lastSocketEvent: e });
          });
        } catch (e) { /*DO nothing*/ }
      }
    })();
  }, []);

  if (fatalError) return <DisplayError error={fatalError} onRefresh={initialiseApp} />;

  if (initialisingApp) return <Splash><ActivityIndicator size={25} color="#999" /></Splash>;

  return (
    <AppContext.Provider
      value={{ state, setState, initialiseApp }}
    >
      <Containers />
    </AppContext.Provider>
  );
}

export default NeotreeApp;

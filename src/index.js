import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import DisplayError from '@/components/DisplayError';
import Splash from '@/components/Splash';
import * as api from './api';
import Containers from './containers';
import AppContext from './AppContext';
import { addSocketEventsListeners } from './socket';

const defaultAppState = {
  fatalError: null,
  initialisingApp: false,
  authenticatedUser: null,
  location: null,
  application: null,
  displaySplash: false,
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

      api.getExportedSessions().then(() => {}).catch(() => {}); // these will load all the exported sessions that are not on this device

      try {
        await api.initialiseDatabase();
        const authenticatedUser = await api.getAuthenticatedUser();
        const location = await api.getLocation();
        let application = null;
        if (location && authenticatedUser) {
          application = await api.getApplication();
          try {
            await api.sync();
          } catch (e) {
            if (!application.last_sync_date) setState({ fatalError: e.message });
          }
          application = await api.getApplication();
        }
        setState({ authenticatedUser, location, application });
      } catch (e) { setState({ fatalError: e.message }); }
      setState({ initialisingApp: false });
    })();
  }, []);

  React.useEffect(() => { initialiseApp(); }, []);

  const { fatalError, initialisingApp, location, displaySplash, application } = state;

  React.useEffect(() => {
    (async () => {
      if (location) {
        try {
          addSocketEventsListeners(location.country, async e => {
            try {
              await api.sync({ resetData: ['data_published', 'changes_discarded'].includes(e.name) });
            } catch (e) { /* Do nothing */ }
            setState({ lastSocketEvent: e });
          });
        } catch (e) { /*DO nothing*/ }
      }
    })();
  }, [location]);

  if (fatalError) return <DisplayError error={fatalError} onRefresh={initialiseApp} />;

  if (initialisingApp || displaySplash) return <Splash><ActivityIndicator size={25} color="#999" /></Splash>;

  return (
    <AppContext.Provider
      value={{ state, setState, initialiseApp }}
    >
      <View style={{ flex: 1 }}>
        <Containers />
      </View>

      {application && (application.mode === 'development') && (
        <View style={{ padding: 5, backgroundColor: '#ccc' }}>
          <Text style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>You're in development mode</Text>
        </View>
      )}
    </AppContext.Provider>
  );
}

export default NeotreeApp;

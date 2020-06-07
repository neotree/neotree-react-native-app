import React from 'react';
import { onAuthStateChanged } from '@/api/auth';
import { syncDatabase } from '@/api/database';
import { useNetworkContext } from '@/contexts/network';
import socket from '@/api/socket';
import Context from './Context';

export default function Provider(props) {
  const networkState = useNetworkContext();

  const [state, _setState] = React.useState({
    lastDataSyncEvent: null,
    syncError: null,
    syncRslts: null,
    dataSynced: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const sync = event => {
    setState({
      syncingData: true,
      dataSynced: state.databaseIsReady ? state.dataSynced : false
    });

    const done = (syncError, syncRslts = {}) => setState({
      syncingData: false,
      dataSynced: true,
      lastDataSyncEvent: event,
      syncError,
      databaseIsReady: syncRslts.dbInitLog ? true : false,
      authenticatedUser: syncRslts.authenticatedUser,
      authenticatedUserInitialised: (event && event.name === 'authenticated_user') || state.authenticatedUserInitialised
    });

    syncDatabase({ event })
      .then(rslts => done(null, rslts))
      .catch(done);
  };

  React.useEffect(() => {
    onAuthStateChanged(user => sync({ name: 'authenticated_user', user }));

    socket.on('create_scripts', data => sync({
      name: 'create_scripts',
      ...data
    }));
    socket.on('update_scripts', data => sync({
      name: 'update_scripts',
      ...data
    }));
    socket.on('delete_scripts', data => sync({
      name: 'delete_scripts',
      ...data
    }));
    socket.on('create_screens', data => sync({
      name: 'create_screens',
      ...data
    }));
    socket.on('update_screens', data => sync({
      name: 'update_screens',
      ...data
    }));
    socket.on('delete_screens', data => sync({
      name: 'delete_screens',
      ...data
    }));
  }, []);

  React.useEffect(() => { sync(); }, [networkState]);

  return (
    <Context.Provider
      {...props}
      value={{
        sync,
        state,
        setState,
      }}
    />
  );
}

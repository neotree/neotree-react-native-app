import React from 'react';
import { onAuthStateChanged } from '@/api/auth';
import { syncDatabase } from '@/api/database';
import { useNetworkContext } from '@/contexts/network';
import socket from '@/api/socket';
import Context from './Context';

export default function Provider(props) {
  const networkState = useNetworkContext();

  const [state, _setState] = React.useState({
    dataSynced: false,
    syncDataError: null,
    lastDataSync: null,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  React.useEffect(() => {
    const sync = event => {
      const done = (error) => {
        setState({
          lastDataSync: { event, error },
        });
      };

      syncDatabase({ event })
        .then(rslts => done(null, rslts))
        .catch(done);
    };

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

  React.useEffect(() => {
    const done = (error) => {
      setState({
        dataSynced: true,
        syncDataError: error,
        lastDataSync: {
          error,
          event: !state.dataSynced ? null : { name: 'app_data_sync' }
        },
      });
    };

    syncDatabase()
      .then(rslts => done(null, rslts))
      .catch(done);
  }, [networkState]);

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
      }}
    />
  );
}

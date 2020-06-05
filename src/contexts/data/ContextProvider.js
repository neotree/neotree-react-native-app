import React from 'react';
import { syncDatabase } from '@/api/database';
import socket from '@/api/socket';
import Context from './Context';

export default function Provider(props) {
  const [state, _setState] = React.useState({
    dbTablesInitialised: false,
    createDBTablesError: null,
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
        dbTablesInitialised: true,
        createDBTablesError: error,
        lastDataSync: { error },
      });
    };

    syncDatabase()
      .then(rslts => done(null, rslts))
      .catch(done);
  }, []);

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

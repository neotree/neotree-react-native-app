import React from 'react';
import PropTypes from 'prop-types';
import { getAuthenticatedUser } from '@/api/auth';
import { syncDatabase, createTablesIfNotExist } from '@/api/database';
import { useNetworkContext } from '@/contexts/network';
// import { onAuthStateChanged } from '@/api/auth';
import Context from './Context';

export default function Provider({ children, socket }) {
  const networkState = useNetworkContext();

  const [state, _setState] = React.useState({
    loadingDataStatus: false,
    dataStatus: null,
    syncingData: false,
    lastDataSyncEvent: null,
    syncError: null,
    acceptedEvents: [],
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const { acceptedEvents, dataStatus, authenticatedUserInitialised, authenticatedUser } = state;

  const sync = (e, callback) => {
    if (e) {
      if (acceptedEvents.indexOf(e.key)  > -1) return;
      require('@/utils/logger')('socket event', JSON.stringify(e));
    }

    // const u = e && e.name === 'authenticated_user' ? e.user : authenticatedUser;
    setState({ 
      syncingData: true, 
      ...(e ? { acceptedEvents: [...acceptedEvents, e.key] } : null),
      // authenticatedUser: u, 
    });

    const done = (syncError, syncRslts = {}) => {
      if (callback) callback(syncError, syncRslts);

      setState({
        syncingData: false,
        lastDataSyncEvent: e,
        syncError,
        dataStatus: syncRslts.dataStatus,
        authenticatedUser: syncRslts.authenticatedUser,
        authenticatedUserInitialised: true,
      });
    };

    syncDatabase({ event: e })
      .then(rslts => done(null, rslts))
      .catch(done);
  };

  React.useEffect(() => {
    createTablesIfNotExist()
      .catch(e => {
        require('@/utils/logger')('ERROR: createTablesIfNotExist', e);
        setState({ createTablesError: e });
      })
      .then(() => {
        setState({ loadingAuthenticatedUser: true });

        getAuthenticatedUser()
          .then(({ user }) => {
            setState({
              authenticatedUser: user,
              loadingAuthenticatedUser: false,
              authenticatedUserInitialised: true,
            });
            if (user) sync();
          })
          .catch(e => setState({
            loadAuthenticatedUserError: e,
            loadingAuthenticatedUser: false,
            authenticatedUserInitialised: true,
          }));
      });
  }, []);

  React.useEffect(() => { if (authenticatedUser) sync(); }, [networkState]);

  React.useEffect(() => {
    // onAuthStateChanged(u => {
    //   sync({ name: 'authenticated_user', user: u });
    // });

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

  const isDataReady = () => {
    return authenticatedUser ?
      dataStatus ? dataStatus.data_initialised : false
      :
      authenticatedUserInitialised;
  };

  return (
    <Context.Provider
      value={{
        sync,
        socket,
        state,
        setState,
        dataIsReady: isDataReady(),
      }}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
  socket: PropTypes.object.isRequired,
};

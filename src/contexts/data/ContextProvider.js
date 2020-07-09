import React from 'react';
import PropTypes from 'prop-types';
import { getAuthenticatedUser } from '@/api/auth';
import { syncDatabase, createTablesIfNotExist } from '@/api/database';
import { useNetworkContext } from '@/contexts/network';
import Context from './Context';
import useSocketEventsListener from './useSocketEventsListener';

export default function Provider({ children, socket }) {
  const networkState = useNetworkContext();

  const [state, _setState] = React.useState({
    loadingDataStatus: false,
    dataStatus: null,
    syncingData: false,
    lastDataSyncEvent: null,
    syncError: null,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const { dataStatus, authenticatedUserInitialised, authenticatedUser } = state;

  const sync = (event, callback) => {
    const u = event && event.name === 'authenticated_user' ? event.user : authenticatedUser;
    setState({ syncingData: true, authenticatedUser: u, });

    const done = (syncError, syncRslts = {}) => {
      if (callback) callback(syncError, syncRslts);

      setState({
        syncingData: false,
        lastDataSyncEvent: event,
        syncError,
        dataStatus: syncRslts.dataStatus,
        authenticatedUser: syncRslts.authenticatedUser,
        authenticatedUserInitialised: true,
      });
    };

    syncDatabase({ event })
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

  useSocketEventsListener({ sync, socket });

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

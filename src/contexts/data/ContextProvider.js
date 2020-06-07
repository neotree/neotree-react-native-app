import React from 'react';
import { getDataStatus, syncDatabase } from '@/api/database';
import { useNetworkContext } from '@/contexts/network';
import Context from './Context';
import useSocketEventsListener from './useSocketEventsListener';

export default function Provider(props) {
  const networkState = useNetworkContext();

  const [state, _setState] = React.useState({
    loadingDataStatus: false,
    dataStatus: null,
    syncingData: false,
    dataSynced: false,
    lastDataSyncEvent: null,
    syncError: null,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const { dataStatus, canSync, authenticatedUserInitialised, dataSynced } = state;

  const sync = (event) => {
    if (dataStatus) {
      setState({
        syncingData: true,
        dataSynced: dataStatus.data_initialised ? dataSynced : false
      });

      const done = (syncError, syncRslts = {}) => {
        setState({
          syncingData: false,
          dataSynced: true,
          lastDataSyncEvent: event,
          syncError,
          dataStatus: syncRslts.dataStatus || dataStatus,
          authenticatedUser: syncRslts.authenticatedUser,
          authenticatedUserInitialised: true,
        });
      };

      syncDatabase({ event })
        .then(rslts => done(null, rslts))
        .catch(done);
    }
  };

  React.useEffect(() => {
    setState({ loadingDataStatus: true });

    getDataStatus()
      .then(dataStatus => {
        setState({
          dataStatus,
          canSync: true,
          loadingDataStatus: false,
        });
      })
      .catch(e => setState({
        loadDataStatusError: e,
        loadingDataStatus: false,
      }));
  }, []);

  React.useEffect(() => { sync(); }, [canSync, networkState]);

  useSocketEventsListener({ sync, state, setState });

  const isDataReady = () => {
    return dataSynced && authenticatedUserInitialised;
  };

  return (
    <Context.Provider
      {...props}
      value={{
        sync,
        state,
        setState,
        isDataReady,
      }}
    />
  );
}

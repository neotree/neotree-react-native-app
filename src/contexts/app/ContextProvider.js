import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import Context from './Context';
import { useDataContext } from '../data';
import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import _getAuthenticatedUser from './_getAuthenticatedUser';

function Provider(props) {
  const { state: { dbTablesInitialised } } = useDataContext();

  const [state, _setState] = React.useState({
    networkState: null,
    authenticatedUser: null,
    authenticatedUserInitialised: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const getAuthenticatedUser = _getAuthenticatedUser({ state, setState });

  const appIsReady = () => {
    return state.authenticatedUserInitialised && dbTablesInitialised;
  };

  React.useEffect(() => { getAuthenticatedUser(); }, []);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(s => setState({ networkState: s }));
    return () => unsubscribe();
  }, []);

  useDataRefresherAfterSync('authenticated_user', () => {
    getAuthenticatedUser(null, { showLoader: false });
  });

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        appIsReady,
      }}
    />
  );
}

export default Provider;

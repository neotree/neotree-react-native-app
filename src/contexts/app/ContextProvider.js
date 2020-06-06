import React from 'react';
import Context from './Context';
import { useDataContext } from '../data';
import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import _getAuthenticatedUser from './_getAuthenticatedUser';

function Provider(props) {
  const { state: { dataSynced } } = useDataContext();

  const [state, _setState] = React.useState({
    overlayLoaderState: {},
    authenticatedUser: null,
    authenticatedUserInitialised: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const displayOverlayLoader = () => Object.keys(state.overlayLoaderState).reduce((acc, key) => {
    if (state.overlayLoaderState[key]) acc = true;
    return acc;
  }, false);

  const getAuthenticatedUser = _getAuthenticatedUser({ state, setState });

  const isAppReady = () => {
    return state.authenticatedUserInitialised && dataSynced;
  };

  React.useEffect(() => { getAuthenticatedUser(); }, []);

  useDataRefresherAfterSync('authenticated_user', () => {
    getAuthenticatedUser(null, { showLoader: false });
  });

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        isAppReady,
        displayOverlayLoader,
      }}
    />
  );
}

export default Provider;

import React from 'react';
import Context from './Context';
import { useDataContext } from '../data';

function Provider(props) {
  const {
    state: {
      dataSynced,
      authenticatedUser,
      authenticatedUserInitialised
    }
  } = useDataContext();

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

  const isAppReady = () => {
    return state.authenticatedUserInitialised && dataSynced;
  };

  React.useEffect(() => {
    setState({
      authenticatedUser,
      authenticatedUserInitialised
    });
  }, [authenticatedUser, authenticatedUserInitialised]);

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

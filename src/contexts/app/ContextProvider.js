import React from 'react';
import Context from './Context';
import { useDataContext } from '../data';

function Provider(props) {
  const {
    isDataReady,
    state: {
      authenticatedUser,
      authenticatedUserInitialised
    }
  } = useDataContext();

  const [state, _setState] = React.useState({
    overlayLoaderState: {},
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const displayOverlayLoader = () => Object.keys(state.overlayLoaderState).reduce((acc, key) => {
    if (state.overlayLoaderState[key]) acc = true;
    return acc;
  }, false);

  const isAppReady = () => isDataReady();

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        isAppReady,
        displayOverlayLoader,
        authenticatedUser,
        authenticatedUserInitialised,
      }}
    />
  );
}

export default Provider;

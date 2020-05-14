import React from 'react';
import Context from './Context';
import { provideDataContext, useDataContext } from '../data';

function Provider(props) {
  const { state: { dbTablesInitialised } } = useDataContext();

  const [state, _setState] = React.useState({
    authenticatedUser: null,
    authenticatedUserInitialised: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const appIsReady = () => {
    return state.authenticatedUserInitialised && dbTablesInitialised;
  };

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

export default provideDataContext(Provider);

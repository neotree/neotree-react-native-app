import React from 'react';
import { getScripts } from '@/api/scripts';
import { useCacheContext } from '@/contexts/cache';

export default Context => {
  return props => {
    const cacheContext = useCacheContext();

    const [state, _setState] = React.useState(cacheContext.homeState || {
      scripts: [],
      loadingScripts: false,
      loadScriptsError: null,
      scriptsInitialised: false,
    });

    const setState = s => _setState(
      typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
    );

    React.useEffect(() => {
      return () => cacheContext.setState({ homeState: state });
    });

    const _getScripts = () => {
      setState({ loadScriptsError: null, loadingScripts: true });
      getScripts()
        .then(payload => {
          setState({
            scripts: payload.scripts || [],
            scriptsInitialised: true,
            loadScriptsError: payload.error,
            loadingScripts: false,
          });
        })
        .catch(e => setState({
          loadScriptsError: e,
          scriptsInitialised: true,
          loadingScripts: false,
        }));
    };

    return (
      <Context.Provider
        {...props}
        value={{
          state,
          setState,
          getScripts: _getScripts
        }}
      />
    );
  };
};

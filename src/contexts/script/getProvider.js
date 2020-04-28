import React from 'react';
import { getScript } from '@/api/scripts';
import { useCacheContext } from '@/contexts/cache';
import { useParams } from 'react-router-native';

export default Context => {
  return props => {
    const { scriptId } = useParams();
    const cacheContext = useCacheContext();

    const [state, _setState] = React.useState(cacheContext.state[`${scriptId}State`] || {
      script: null,
      loadingScript: false,
      loadingScriptError: false,
      scriptInitialised: false,
    });

    const setState = s => _setState(
      typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
    );

    const _getScript = () => {
      setState({ loadScriptError: null, loadingScript: true });
      getScript({ payload: { id: scriptId } })
        .then(payload => {
          setState({
            script: payload.script,
            scriptInitialised: true,
            loadScriptError: payload.error,
            loadingScript: false,
          });
        })
        .catch(e => setState({
          loadScriptError: e,
          scriptInitialised: true,
          loadingScript: false,
        }));
    };

    const initialisePage = (opts = {}) => {
      if (opts.force || !state.screensInitialised) {
        _getScript();
      }
    };

    React.useEffect(() => { initialisePage(); }, [scriptId]);

    React.useEffect(() => {
      return () => cacheContext.setState({ [`${scriptId}State`]: state });
    }, [state]);

    return (
      <Context.Provider
        {...props}
        value={{
          state,
          setState,
          initialisePage,
          getScript: _getScript
        }}
      />
    );
  };
};

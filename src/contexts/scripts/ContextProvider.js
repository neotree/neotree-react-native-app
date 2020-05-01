import React from 'react';
import { useCacheContext } from '@/contexts/cache';
import useRouter from '@/utils/useRouter';
import Context from './Context';

import _getScripts from './_getScripts';

export default function Provider(props) {
  const router = useRouter();
  const cacheContext = useCacheContext();

  const [state, _setState] = React.useState(cacheContext.state.scriptsState || {
    scripts: [],
    loadingScripts: false,
    loadScriptsError: null,
    scriptsInitialised: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const getScripts = _getScripts({ state, setState, router });

  const initialisePage = () => {
    if (!state.scriptsInitialised) getScripts();
  };

  React.useEffect(() => { initialisePage(); }, []);

  React.useEffect(() => {
    return () => cacheContext.setState({ scriptsState: state });
  }, [state]);

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        initialisePage,
        getScripts
      }}
    />
  );
}

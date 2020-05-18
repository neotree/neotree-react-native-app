import React from 'react';
import { useCacheContext } from '@/contexts/cache';
import useRouter from '@/utils/useRouter';
import Context from './Context';

import _getScript from './_getScript';

export default function Provider(props) {
  const router = useRouter();
  const { scriptId } = router.match.params;
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

  const getScript = _getScript({ state, setState, router });

  const initialisePage = (opts = {}) => {
    if (opts.force || !state.screensInitialised) {
      getScript();
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
        getScript
      }}
    />
  );
}

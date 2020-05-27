import React from 'react';
import useRouter from '@/utils/useRouter';
import Context from './Context';

import _getScript from './_getScript';

export default function Provider(props) {
  const router = useRouter();
  const { scriptId } = router.match.params;

  const [state, _setState] = React.useState({
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

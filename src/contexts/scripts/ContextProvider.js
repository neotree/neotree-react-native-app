import React from 'react';
import useRouter from '@/utils/useRouter';
import Context from './Context';

import _getScripts from './_getScripts';

export default function Provider(props) {
  const router = useRouter();

  const [state, _setState] = React.useState({
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

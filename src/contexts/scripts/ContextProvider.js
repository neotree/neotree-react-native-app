import React from 'react';
import PropTypes from 'prop-types';
import useRouter from '@/utils/useRouter';
import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import Context from './Context';

import _getScripts from './_getScripts';

export default function Provider({ children }) {
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

  useDataRefresherAfterSync('scripts', () => {
    getScripts(null, { showLoader: false });
  });

  useDataRefresherAfterSync('app_data_sync', () => {
    getScripts(null, { showLoader: false });
  });

  return (
    <Context.Provider
      value={{
        state,
        setState,
        initialisePage,
        getScripts
      }}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};

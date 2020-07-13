import React from 'react';
import PropTypes from 'prop-types';
import useRouter from '@/utils/useRouter';
import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import Context from './Context';

import _getConfigKeys from './_getConfigKeys';
import _getConfiguration from './_getConfiguration';
import _saveConfiguration from './_saveConfiguration';

export default function Provider({ children }) {
  const router = useRouter();

  const [state, _setState] = React.useState({
    config_keys: [],
    configuration: {},
    loadingConfigKeys: false,
    loadConfigKeysError: null,
    configKeysInitialised: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const getConfigKeys = _getConfigKeys({ state, setState, router });
  const getConfiguration = _getConfiguration({ state, setState, router });
  const saveConfiguration = _saveConfiguration({ state, setState, router });

  const initialisePage = () => {
    getConfiguration();
    getConfigKeys();
  };

  React.useEffect(() => { initialisePage(); }, []);

  useDataRefresherAfterSync('configKeys', () => {
    getConfigKeys(null, { showLoader: false });
  });

  useDataRefresherAfterSync('app_data_sync', () => {
    getConfigKeys(null, { showLoader: false });
  });

  return (
    <Context.Provider
      value={{
        state,
        setState,
        initialisePage,
        getConfigKeys,
        getConfiguration,
        saveConfiguration
      }}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};

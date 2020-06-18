import { getConfigKeys } from '@/api/config_keys';

export default ({ setState }) => (payload, opts = {}) => {
  setState({
    loadConfigKeysError: null,
    loadingConfigKeys: opts.showLoader !== false
  });

  getConfigKeys({ ...payload })
    .then(payload => {
      setState({
        config_keys: payload.config_keys || [],
        configKeysInitialised: true,
        loadConfigKeysError: payload.error,
        loadingConfigKeys: false,
      });
    })
    .catch(e => {
      setState({
        loadConfigKeysError: e,
        configKeysInitialised: true,
        loadingConfigKeys: false,
      });
    });
};

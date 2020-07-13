import { getConfigKeys } from '@/api/config_keys';

export default ({ setState }) => (payload, opts = {}) => {
  setState({
    loadConfigKeysError: null,
    loadingConfigKeys: opts.showLoader !== false
  });

  getConfigKeys({ ...payload })
    .then(res => {
      setState({
        config_keys: res.config_keys || [],
        configKeysInitialised: true,
        loadConfigKeysError: res.error,
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

import { getConfigKeys } from '@/api/config_keys';

export default function _getConfigKeys(payload, opts = {}) {
  this.setState({
    loadConfigKeysError: null,
    loadingConfigKeys: opts.showLoader !== false
  });

  getConfigKeys({ ...payload })
    .then(res => {
      this.setState({
        config_keys: res || [],
        configKeysInitialised: true,
        loadingConfigKeys: false,
      });
    })
    .catch(e => {
      this.setState({
        loadConfigKeysError: e,
        configKeysInitialised: true,
        loadingConfigKeys: false,
      });
    });
}

import { getConfiguration } from '@/api/database/configuration';

export default function _getConfiguration(payload, opts = {}) {
  this.setState({
    loadConfigurationError: null,
    loadingConfiguration: opts.showLoader !== false
  });

  getConfiguration({ ...payload })
    .then(res => {
      this.setState({
        configuration: { ...(res.configuration || {}).data },
        configKeysInitialised: true,
        loadConfigurationError: res.error,
        loadingConfiguration: false,
      });
    })
    .catch(e => {
      this.setState({
        loadConfigurationError: e,
        configKeysInitialised: true,
        loadingConfiguration: false,
      });
    });
}

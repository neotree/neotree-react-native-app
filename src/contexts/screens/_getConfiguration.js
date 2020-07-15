import { getConfiguration } from '@/api/database/configuration';

export default ({ setState }) => (payload, opts = {}) => {
  setState({
    loadConfigurationError: null,
    loadingConfiguration: opts.showLoader !== false
  });

  getConfiguration({ ...payload })
    .then(res => {
      setState({
        configuration: { ...(res.configuration || {}).data },
        configKeysInitialised: true,
        loadConfigurationError: res.error,
        loadingConfiguration: false,
      });
    })
    .catch(e => {
      setState({
        loadConfigurationError: e,
        configKeysInitialised: true,
        loadingConfiguration: false,
      });
    });
};

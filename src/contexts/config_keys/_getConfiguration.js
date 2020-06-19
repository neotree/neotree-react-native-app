import { getConfiguration } from '@/api/database/configuration';

export default ({ setState }) => (payload, opts = {}) => {
  setState({
    loadConfigurationError: null,
    loadingConfiguration: opts.showLoader !== false
  });

  getConfiguration({ ...payload })
    .then(payload => {
      setState({
        configuration: { ...(payload.configuration || {}).data },
        configKeysInitialised: true,
        loadConfigurationError: payload.error,
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

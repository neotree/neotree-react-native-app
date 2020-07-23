import * as api from '@/api/database/configuration';

export default function getConfiguration(payload, opts = {}) {
  const { setState } = this;

  setState({
    loadConfigurationError: null,
    loadingConfiguration: opts.showLoader !== false
  });

  api.getConfiguration({ ...payload })
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
}

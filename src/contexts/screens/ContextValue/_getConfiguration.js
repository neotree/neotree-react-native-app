import * as api from '@/api/database/configuration';

export default function getConfiguration(payload, opts = {}) {
  return new Promise((resolve, reject) => {
    this.setState({
      loadConfigurationError: null,
      loadingConfiguration: opts.showLoader !== false
    });
  
    api.getConfiguration({ ...payload })
      .then(res => {
        this.setState({
          configuration: { ...(res.configuration || {}).data },
          configKeysInitialised: true,
          loadConfigurationError: res.error,
          loadingConfiguration: false,
        });
        resolve(res);
      })
      .catch(e => {
        this.setState({
          loadConfigurationError: e,
          configKeysInitialised: true,
          loadingConfiguration: false,
        });
        reject(e);
      });
  });
}

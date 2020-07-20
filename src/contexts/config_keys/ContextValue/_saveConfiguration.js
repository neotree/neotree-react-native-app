import { saveConfiguration } from '@/api/database/configuration';

export default function _saveConfiguration(payload, opts = {}) {
  const state = this.state;
  const configuration = { ...state.configuration, ...payload };

  this.setState({
    configuration,
    saveConfigurationError: null,
    savingConfiguration: opts.showLoader !== false
  });

  saveConfiguration(configuration)
    .then(res => {
      this.setState({
        configKeysInitialised: true,
        saveConfigurationError: res.error,
        savingConfiguration: false,
      });
    })
    .catch(e => {
      this.setState({
        saveConfigurationError: e,
        configKeysInitialised: true,
        savingConfiguration: false,
      });
    });
}

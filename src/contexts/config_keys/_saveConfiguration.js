import { saveConfiguration } from '@/api/database/configuration';

export default ({ state, setState }) => (payload, opts = {}) => {
  const configuration = { ...state.configuration, ...payload };

  setState({
    configuration,
    saveConfigurationError: null,
    savingConfiguration: opts.showLoader !== false
  });

  saveConfiguration(configuration)
    .then(res => {
      setState({
        configKeysInitialised: true,
        saveConfigurationError: res.error,
        savingConfiguration: false,
      });
    })
    .catch(e => {
      setState({
        saveConfigurationError: e,
        configKeysInitialised: true,
        savingConfiguration: false,
      });
    });
};

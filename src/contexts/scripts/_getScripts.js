import { getScripts } from '@/api/scripts';

export default ({ setState }) => (payload, opts = {}) => {
  setState({
    loadScriptsError: null,
    loadingScripts: opts.showLoader !== false
  });

  getScripts({ ...payload })
    .then(payload => {
      setState({
        scripts: payload.scripts || [],
        scriptsInitialised: true,
        loadScriptsError: payload.error,
        loadingScripts: false,
      });
    })
    .catch(e => {
      setState({
        loadScriptsError: e,
        scriptsInitialised: true,
        loadingScripts: false,
      });
    });
};

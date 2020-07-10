import { getScripts } from '@/api/scripts';

export default ({ setState }) => (payload, opts = {}) => {
  setState({
    loadScriptsError: null,
    loadingScripts: opts.showLoader !== false
  });

  getScripts({ ...payload })
    .then(res => {
      setState({
        scripts: res.scripts || [],
        scriptsInitialised: true,
        loadScriptsError: res.error,
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

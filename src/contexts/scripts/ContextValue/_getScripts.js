import { getScripts } from '@/api/scripts';

export default function _getScripts(payload, opts = {}) {
  this.setState({
    loadScriptsError: null,
    loadingScripts: opts.showLoader !== false
  });

  getScripts({ ...payload })
    .then(res => {
      this.setState({
        scripts: res.scripts || [],
        scriptsInitialised: true,
        loadScriptsError: res.error,
        loadingScripts: false,
      });
    })
    .catch(e => {
      this.setState({
        loadScriptsError: e,
        scriptsInitialised: true,
        loadingScripts: false,
      });
    });
}

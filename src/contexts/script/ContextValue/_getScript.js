import { getScript } from '@/api/scripts';

export default function _getScripts(payload, opts = {}) {
  const {
    setState,
    router: {
      match: { params: { scriptId } }
    }
  } = this;

  return new Promise((resolve, reject) => {
    setState({
      loadScriptError: null,
      loadingScript: opts.showLoader !== false
    });
  
    getScript({ id: scriptId, ...payload })
      .then(res => {
        setState({
          script: res.script,
          scriptInitialised: true,
          loadScriptError: res.error,
          loadingScript: false,
        });
        resolve(res);
      })
      .catch(e => {
        setState({
          loadScriptError: e,
          scriptInitialised: true,
          loadingScript: false,
        });
        reject(e);
      });
  });
}

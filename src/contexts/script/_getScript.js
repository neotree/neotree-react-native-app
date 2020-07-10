import { getScript } from '@/api/scripts';

export default ({
  setState,
  router: {
    match: { params: { scriptId } }
  }
}) => (payload, opts = {}) => {
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
    })
    .catch(e => setState({
      loadScriptError: e,
      scriptInitialised: true,
      loadingScript: false,
    }));
};

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

  getScript({ payload: { id: scriptId, ...payload } })
    .then(payload => {
      setState({
        script: payload.script,
        scriptInitialised: true,
        loadScriptError: payload.error,
        loadingScript: false,
      });
    })
    .catch(e => setState({
      loadScriptError: e,
      scriptInitialised: true,
      loadingScript: false,
    }));
};

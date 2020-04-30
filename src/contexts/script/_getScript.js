import { getScript } from '@/api/scripts';

export default ({
  setState,
  router: {
    match: { params: { scriptId } }
  }
}) => () => {
  setState({ loadScriptError: null, loadingScript: true });
  getScript({ payload: { id: scriptId } })
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

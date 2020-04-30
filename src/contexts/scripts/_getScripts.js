import { getScripts } from '@/api/scripts';

export default ({
  setState
}) => () => {
  setState({ loadScriptsError: null, loadingScripts: true });
  getScripts()
    .then(payload => {
      setState({
        scripts: payload.scripts || [],
        scriptsInitialised: true,
        loadScriptsError: payload.error,
        loadingScripts: false,
      });
    })
    .catch(e => setState({
      loadScriptsError: e,
      scriptsInitialised: true,
      loadingScripts: false,
    }));
};

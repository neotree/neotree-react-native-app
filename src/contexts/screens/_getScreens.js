import { getScreens } from '@/api/screens';

export default ({
  setState,
  router: {
    match: { params: { scriptId } }
  }
}) => (payload, opts = {}) => {
  setState({
    loadScreensError: null,
    loadingScreens: opts.showLoader !== false,
    // screensInitialised: false
  });

  getScreens({ script_id: scriptId, ...payload })
    .then(res => {
      setState({
        screens: res.screens || [],
        screensInitialised: true,
        loadScreensError: res.error,
        loadingScreens: false,
      });
    })
    .catch(e => setState({
      loadScreensError: e,
      screensInitialised: true,
      loadingScreens: false,
    }));
};

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

  getScreens({ payload: { script_id: scriptId, ...payload } })
    .then(payload => {
      setState({
        screens: payload.screens || [],
        screensInitialised: true,
        loadScreensError: payload.error,
        loadingScreens: false,
      });
    })
    .catch(e => setState({
      loadScreensError: e,
      screensInitialised: true,
      loadingScreens: false,
    }));
};

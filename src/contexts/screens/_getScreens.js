import { getScreens } from '@/api/screens';

export default ({
  setState,
  router: {
    match: { params: { scriptId } }
  }
}) => () => {
  setState({ loadScreensError: null, loadingScreens: true, screensInitialised: false });
  getScreens({ payload: { script_id: scriptId } })
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

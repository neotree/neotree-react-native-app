import { getScreens } from '@/api/screens';

export default ({
  setState,
  router: {
    match: { params: { scriptId } }
  }
}) => () => {
  setState({ loadScreensError: null, loadingScreens: true });
  getScreens({ payload: { script_id: scriptId } })
    .then(payload => {
      const _activeScreenIndex = 0;
      setState({
        screens: payload.screens || [],
        screensInitialised: true,
        loadScreensError: payload.error,
        loadingScreens: false,
        activeScreen: payload.screens[_activeScreenIndex],
        activeScreenIndex: _activeScreenIndex
      });
    })
    .catch(e => setState({
      loadScreensError: e,
      screensInitialised: true,
      loadingScreens: false,
    }));
};

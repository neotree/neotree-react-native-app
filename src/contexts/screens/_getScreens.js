import * as api from '@/api/screens';

export default function getScreens(payload, opts = {}) {
  const {
    setState,
    router: {
      match: { params: { scriptId } }
    }
  } = this;

  return new Promise((resolve, reject) => {
    setState({
      loadScreensError: null,
      loadingScreens: opts.showLoader !== false,
      // screensInitialised: false
    });
  
    api.getScreens({ script_id: scriptId, ...payload })
      .then(res => {
        setState({
          screens: res.screens || [],
          screensInitialised: true,
          loadScreensError: res.error,
          loadingScreens: false,
        });
        resolve(res);
      })
      .catch(e => {
        setState({
          loadScreensError: e,
          screensInitialised: true,
          loadingScreens: false,
        });
        reject(e);
      });
  });
}

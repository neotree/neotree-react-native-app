import * as defaults from './_defaults';

export { defaults };

export default class ContextValue {
  constructor(params) {
    this.defaults = defaults;
    require('./_init').default.bind(this)(params);
  }

  setState = s => this._setState(prevState => ({
    ...prevState,
    ...(typeof s === 'function' ? s(prevState) : s)
  }));

  loadFonts = require('./_loadFonts').default.bind(this);

  initialiseApp = require('./_initialiseApp').default.bind(this);

  initialiseData = require('./_initialiseData').default.bind(this);

  signIn = require('./_signIn').default.bind(this);

  signOut = require('./_signOut').default.bind(this);

  isAppReady = () => this.state.fontsLoaded && this.dataIsReady;

  getSplashScreenInfo = require('./_getSplashScreenInfo').default.bind(this);

  displayOverlayLoader = () => Object.keys(this.state.overlayLoaderState)
    .reduce((acc, key) => {
      if (this.state.overlayLoaderState[key]) acc = true;
      return acc;
    }, false);

  sync = require('./_sync').default.bind(this);

  addSocketEventsListeners = require('./_addSocketEventsListeners').default.bind(this);

  getAuthenticatedUser = require('./_getAuthenticatedUser').default.bind(this);

  isDataReady = () => {
    const {
      syncingData,
      authenticatedUser,
      dataStatus,
      authenticatedUserInitialised
    } = this.state;

    return authenticatedUser ?
      dataStatus ? dataStatus.data_initialised : false
      :
      syncingData ? false : authenticatedUserInitialised;
  };
}

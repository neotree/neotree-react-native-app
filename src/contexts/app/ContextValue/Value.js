import * as defaults from './_defaults';

export { defaults };

export default class ContextValue {
  constructor(params) {
    this.defaults = defaults;
    this.init(params);
  }

  setState = s => this._setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  init = require('./_init').default.bind(this);

  loadFonts = require('./_loadFonts').default.bind(this);

  isAppReady = () => this.state.fontsLoaded && this.dataContext.dataIsReady;

  getSplashScreenInfo = require('./_getSplashScreenInfo').default.bind(this);

  displayOverlayLoader = () => Object.keys(this.state.overlayLoaderState)
    .reduce((acc, key) => {
      if (this.state.overlayLoaderState[key]) acc = true;
      return acc;
    }, false);
}

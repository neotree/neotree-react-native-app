import * as defaults from './_defaults';

export { defaults };

export default class ContextValue {
  constructor(params) {
    this.defaults = defaults;
    this.init(params);
  }

  init = require('./_init').default.bind(this);

  setState = s => this._setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  setForm = s => this._setState(prevState => ({
    ...prevState,
    form: { ...prevState.form, ...typeof s === 'function' ? s(prevState.form) : s }
  }));

  initialisePage = () => {
    this.getScreens();
    this.getConfiguration();
  };

  canGoToNextScreen = () => {
    if (!this.getScreenLink('next')) return false;
    if (!this.state.form.filter(({ screen }) => screen.id === this.state.activeScreen.id)[0]) return false;
    return true;
  };

  onLocationChange = require('./_onLocationChange').default.bind(this);

  canGoToPrevScreen = () => !!this.getScreenLink('back');

  isLastScreen = () => this.state.activeScreen && (this.state.activeScreen.id === this.getLastScreen().id);

  getScreen = require('./_getScreen').default.bind(this);

  getScreenLink = require('./_getScreenLink').default.bind(this);

  getLastScreen = require('./_getLastScreen').default.bind(this);

  getScreens = require('./_getScreens').default.bind(this);

  parseScreenCondition = require('./_parseScreenCondition').default.bind(this);

  canSave = require('./_canSave').default.bind(this);

  saveForm = require('./_saveForm').default.bind(this);

  getConfiguration = require('./_getConfiguration').default.bind(this);
}

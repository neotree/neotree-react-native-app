import * as defaults from './_defaults';

export { defaults };

export default class ContextValue {
  constructor(params) {
    this.defaults = defaults;
    this.init(params);
  }

  setState = s => this._setState(prevState => ({
    ...prevState,
    ...(typeof s === 'function' ? s(prevState) : s)
  }));

  init = require('./_init').default.bind(this);

  getScripts = require('./_getScripts').default.bind(this);

  initialisePage = () => this.getScripts();
}

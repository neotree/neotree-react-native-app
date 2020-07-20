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

  getConfigKeys = require('./_getConfigKeys').default.bind(this);

  getConfiguration = require('./_getConfiguration').default.bind(this);

  saveConfiguration = require('./_saveConfiguration').default.bind(this);
}

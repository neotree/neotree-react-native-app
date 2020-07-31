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

  getConfigKeys = require('./_getConfigKeys').default.bind(this);

  getConfiguration = require('./_getConfiguration').default.bind(this);

  saveConfiguration = require('./_saveConfiguration').default.bind(this);
}

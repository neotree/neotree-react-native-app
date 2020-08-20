import * as defaults from './_defaults';

export { defaults };

export default class ContextValue {
  constructor({
    state,
    setState,
    router,
  }) {
    this.defaults = defaults;
    this.state = state;
    this._setState = setState;
    this.router = router;
  }

  setState = s => this._setState(prevState => ({
    ...prevState,
    ...(typeof s === 'function' ? s(prevState) : s)
  }));

  getConfigKeys = require('./_getConfigKeys').default.bind(this);

  getConfiguration = require('./_getConfiguration').default.bind(this);

  saveConfiguration = require('./_saveConfiguration').default.bind(this);
}

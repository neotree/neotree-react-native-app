import * as defaults from './_defaults';

export { defaults };

export default class ContextValue {
  constructor({
    state,
    setState,
    router,
    appContext: { state: { uid_prefix } },
  }) {
    this.defaults = defaults;
    this.state = state;
    this._setState = setState;
    this.router = router;
    this.uid_prefix = uid_prefix;
  }

  setState = s => this._setState(prevState => ({
    ...prevState,
    ...(typeof s === 'function' ? s(prevState) : s)
  }));

  getScript = require('./_getScript').default.bind(this);

  getSessionsStats = require('./_getSessionsStats').default.bind(this);

  initialisePage = () => {
    this.getSessionsStats();
    this.getScript();
  };
}

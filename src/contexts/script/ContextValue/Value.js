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

  getScript = require('./_getScript').default.bind(this);

  getScriptStats = require('./_getScriptStats').default.bind(this);

  saveScriptStats = require('./_saveScriptStats').default.bind(this);

  countSessions = require('./_countSessions').default.bind(this);

  initialisePage = () => {
    this.getScript();
    this.countSessions();
    this.getScriptStats();
  };
}

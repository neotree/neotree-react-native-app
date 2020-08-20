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

  getDiagnoses = require('./_getDiagnoses').default.bind(this);

  initialisePage = (opts = {}) => {
    if (opts.force || !this.state.diagnosesInitialised) {
      this.getDiagnoses();
    }
  };
}

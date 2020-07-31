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

  getDiagnoses = require('./_getDiagnoses').default.bind(this);

  initialisePage = (opts = {}) => {
    if (opts.force || !this.state.diagnosesInitialised) {
      this.getDiagnoses();
    }
  };
}

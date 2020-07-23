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

  sync = require('./_sync').default.bind(this);

  initialiseData = require('./_initialiseData').default.bind(this);

  addSocketEventsListeners = require('./_addSocketEventsListeners').default.bind(this);

  isDataReady = () => {
    const {
      syncingData,
      authenticatedUser,
      dataStatus,
      authenticatedUserInitialised
    } = this.state;

    return authenticatedUser ?
      dataStatus ? dataStatus.data_initialised : false
      :
      syncingData ? false : authenticatedUserInitialised;
  };
}

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

  deleteSessions = require('./_deleteSessions').default.bind(this);

  getSessions = require('./_getSessions').default.bind(this);

  export = require('./export').default.bind(this);

  selectItems = ids => {
    ids = ids && ids.map ? ids : [ids];
    this.setState(prevState => {
      const addIds = ids.filter(id => prevState.selectedItems.indexOf(id) === -1);
      const removeIds = ids.filter(id => prevState.selectedItems.indexOf(id) >= 0);

      return {
        ...prevState,
        selectedItems: [
          ...addIds,
          ...prevState.selectedItems.filter(id => removeIds.indexOf(id) < 0)
        ]
      };
    });
  };
}

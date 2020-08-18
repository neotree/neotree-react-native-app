import * as defaults from './_defaults';
import { exportJSON, exportEXCEL, exportToApi } from './export';

export { defaults };

export default class ContextValue {
  constructor({
    state,
    setState,
    router,
    appContext,
  }) {
    this.defaults = defaults;
    this.state = state;
    this._setState = setState;
    this.router = router;
    this.uid_prefix = appContext.state.uid_prefix;
  }

  setState = s => this._setState(prevState => ({
    ...prevState,
    ...(typeof s === 'function' ? s(prevState) : s)
  }));

  deleteSessions = require('./_deleteSessions').default.bind(this);

  getSessions = require('./_getSessions').default.bind(this);

  exportJSON = exportJSON.bind(this);

  exportEXCEL = exportEXCEL.bind(this);

  exportToApi = exportToApi.bind(this);

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

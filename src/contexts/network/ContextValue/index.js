export default class ContextValue {
  constructor({ 
    state, 
    setState, 
    router,  
  }) {
    this.state = state;
    this._setState = setState;
    this.router = router;
  };

  setState = s => this._setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  setForm = s => this._setState(prevState => ({
    ...prevState,
    form: { ...prevState.form, ...typeof s === 'function' ? s(prevState.form) : s }
  }));
}

export default function init({
  state,
  setState,
  router,
  appContext,
}) {
  this.state = state;
  this._setState = setState;
  this.router = router;
  this.uid_prefix = appContext.state.uid_prefix;
}

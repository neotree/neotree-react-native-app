export default function init({
  state,
  setState,
  networkContext,
}) {
  this.state = state;
  this._setState = setState;
  this.networkContext = networkContext;
  this.dataIsReady = this.isDataReady();
}

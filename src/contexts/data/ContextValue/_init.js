export default function init({
  state,
  setState,
  networkContext,
  props,
}) {
  this.state = state;
  this._setState = setState;
  this.networkContext = networkContext;
  this.socket = props.socket;
  this.dataIsReady = this.isDataReady();
}

export default function init({
  state,
  setState,
  props,
}) {
  this.state = state;
  this._setState = setState;
  this.socket = props.socket;
}

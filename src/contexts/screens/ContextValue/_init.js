export default function init({
  state,
  setState,
  router,
  diagnoses,
  script,
}) {
  this.state = state;
  this._setState = setState;
  this.router = router;
  this.script = script;
  this.diagnoses = diagnoses;
}

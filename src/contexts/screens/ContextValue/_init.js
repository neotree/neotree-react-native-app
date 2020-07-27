export default function init({
  state,
  setState,
  router,
  scriptContext: { saveScriptStats, state: { script, stats } },
  diagnosesContext: { state: { diagnoses } },
}) {
  this.state = state;
  this._setState = setState;
  this.router = router;
  this.script = script;
  this.scriptStats = stats;
  this.saveScriptStats = saveScriptStats;
  this.diagnoses = diagnoses;
}

import { saveScriptStats } from '@/api/stats';

export default function _saveScriptStats(payload, opts = {}) {
  const {
    setState,
    router: {
      match: { params: { scriptId } }
    },
    state: { stats },
  } = this;

  setState({
    saveScriptStatsError: null,
    savingScriptStats: opts.showLoader !== false
  });

  const _stats = {
    ...stats,
    script_id: scriptId,
    ...(stats && typeof payload === 'function' ? payload(stats) : payload)
  };

  saveScriptStats(_stats)
    .then(res => {
      setState({
        stats: _stats,
        scriptInitialised: true,
        saveScriptStatsError: res.error,
        savingScriptStats: false,
      });
    })
    .catch(e => setState({
      saveScriptStatsError: e,
      scriptInitialised: true,
      savingScriptStats: false,
    }));
}

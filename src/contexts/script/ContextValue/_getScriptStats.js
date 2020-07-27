import { getScriptStats } from '@/api/stats';

export default function _getScriptStats(payload, opts = {}) {
  const {
    setState,
    router: {
      match: { params: { scriptId } }
    }
  } = this;

  setState({
    loadScriptStatsError: null,
    loadingScriptStats: opts.showLoader !== false
  });

  getScriptStats({ script_id: scriptId, ...payload })
    .then(res => {
      setState({
        stats: res.stat,
        scriptInitialised: true,
        loadScriptStatsError: res.error,
        loadingScriptStats: false,
      });
    })
    .catch(e => setState({
      loadScriptStatsError: e,
      scriptInitialised: true,
      loadingScriptStats: false,
    }));
}

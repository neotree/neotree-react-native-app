import { getStats } from '@/api/sessions_stats';

export default function _getSessionsStats(payload, opts = {}) {
  return new Promise((resolve, reject) => {
    this.setState({
      loadSessionsStatsError: null,
      loadingSessionsStats: opts.showLoader !== false
    });
  
    getStats(payload)
      .then(res => {
        const { stats } = res;
        this.setState({
          sessionsStats: stats,
          loadingSessionsStats: false,
          uid: `${this.uid_prefix}-${`000${stats.total_sessions + 1}`.slice(-4)}`,
        });
        resolve(res);
      })
      .catch(e => {
        this.setState({
          loadSessionsStatsError: e,
          loadingSessionsStats: false,
        });
        reject(e);
      });
  });
}

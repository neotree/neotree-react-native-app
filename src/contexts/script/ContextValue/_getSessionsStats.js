import { getStats } from '@/api/sessions_stats';

export default function _getSessionsStats(payload, opts = {}) {
  this.setState({
    loadSessionsStatsError: null,
    loadingSessionsStats: opts.showLoader !== false
  });

  getStats(payload)
    .then(({ stats }) => {
      this.setState({
        sessionsStats: stats,
        loadingSessionsStats: false,
        uid: `${this.uid_prefix}-${`000${stats.total_sessions + 1}`.slice(-4)}`,
      });
    })
    .catch(e => this.setState({
      loadSessionsStatsError: e,
      loadingSessionsStats: false,
    }));
}

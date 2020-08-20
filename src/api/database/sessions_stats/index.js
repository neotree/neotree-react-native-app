import getStats from './_getStats';
import saveStats from './_saveStats';

export { getStats, saveStats };

export const updateSessionsStats = completed => new Promise((resolve, reject) => {
  getStats()
    .then(({ stats }) => {
      const _stats = {
        ...stats,
        total_sessions: stats.total_sessions + 1,
        ...(completed ?
          { completed_sessions: stats.completed_sessions + 1, }
          :
          { incompleted_sessions: stats.incompleted_sessions + 1, }),
      };
      saveStats(_stats);
    })
    .then(resolve)
    .catch(reject);
});

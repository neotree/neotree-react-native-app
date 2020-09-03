import {
  getStats as _getStats,
  saveStats as _saveStats
} from '../database/sessions_stats';

const defaultStat = {
  id: 1,
  total_sessions: 0,
  incompleted_sessions: 0,
  completed_sessions: 0,
};

export const getStats = () => {
  return new Promise((resolve, reject) => {
    _getStats({ id: 1 })
      .then(rslts => {
        if (rslts.stats) return resolve(rslts);

        _saveStats(defaultStat)
          .then(() => resolve({ stats: defaultStat }))
          .catch(reject);
      })
      .catch(reject);
  });
};

export const saveStats = payload => {
  return new Promise((resolve, reject) => {
    _getStats()
      .then(rslts => {
        _saveStats({
          ...defaultStat,
          ...rslts.stats,
          ...payload,
        })
          .then(stats => resolve({ stats }))
          .catch(reject);
      })
      .catch(reject);
  });
};

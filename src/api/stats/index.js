import { getStat, saveStat } from '../database/stats';

const defaultStat = {
  total_sessions: 0,
  incompleted_sessions: 0,
  completed_sessions: 0,
};

export const getScriptStats = (payload = {}) => {
  const finder = payload.script_id ? { script_id: payload.script_id } : null;

  return new Promise((resolve, reject) => {
    if (!finder) return reject(new Error('Missing required param: script_id'));

    getStat(finder)
      .then(rslts => {
        if (rslts.stat) return resolve(rslts);

        saveStat({ ...defaultStat, script_id: payload.script_id, })
          .then(rslts => resolve(rslts))
          .catch(reject);
      })
      .catch(reject);
  });
};

export const saveScriptStats = (payload = {}) => {
  const finder = payload.script_id ? { script_id: payload.script_id } : null;

  return new Promise((resolve, reject) => {
    if (!finder) return reject(new Error('Missing required param: script_id'));

    getStat(finder)
      .then(rslts => {
        saveStat({
          ...defaultStat,
          ...rslts.stat,
          ...payload,
        })
          .then(stat => resolve({ stat }))
          .catch(reject);
      })
      .catch(reject);
  });
};

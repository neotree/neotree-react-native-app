import db from '../db';
import { updateSessionsStats } from '../sessions_stats';

export default (data = {}) => new Promise((resolve, reject) => {
  const done = (err, rslts) => {
    if (err) return reject(err);
    resolve(rslts);
  };

  const { data: { completed_at } } = data;

  const columns = [data.id ? 'id' : '', 'uid', 'script_id', 'data', 'completed', 'exported', 'createdAt', 'updatedAt']
    .filter(c => c)
    .join(',');

  const values = [data.id ? '?' : '', '?', '?', '?', '?', '?', '?', '?']
    .filter(c => c)
    .join(',');

  const params = [
    ...data.id ? [data.id] : [],
    data.uid,
    data.script_id,
    JSON.stringify(data.data || '{}'),
    data.completed || false,
    data.exported || false,
    data.createdAt || new Date().toISOString(),
    data.updatedAt || new Date().toISOString(),
  ];

  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into sessions (${columns}) values (${values});`,
        params,
        (tx, rslts) => {
          done(null, rslts);
          updateSessionsStats(!!completed_at);
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: saveSession', e);
            reject(e);
          }
        }
      );
    }
  );
});

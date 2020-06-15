import db from '../db';

export default (data = {}) => new Promise((resolve, reject) => {
  const done = (err, rslts) => {
    if (err) return reject(err);
    resolve(rslts);
  };

  const columns = [data.id ? 'id' : '', 'script_id', 'data', 'completed', 'exported', 'createdAt', 'updatedAt']
    .filter(c => c)
    .join(',');

  const values = [data.id ? '?' : '', '?', '?', '?', '?', '?', '?']
    .filter(c => c)
    .join(',');

  const params = [
    ...data.id ? [data.id] : [],
    data.script_id,
    JSON.stringify(data.data || '{}'),
    data.completed || false,
    data.exported || false,
    data.createdAt || new Date().toString(),
    data.updatedAt || new Date().toString(),
  ];

  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into sessions (${columns}) values (${values});`,
        params,
        (tx, rslts) => done(null, rslts),
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

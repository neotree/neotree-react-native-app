import db from '../db';

const query = s => new Promise((resolve, reject) => {
  const columns = ['id', 'config_key_id', 'data', 'createdAt', 'updatedAt'].join(',');

  const values = ['?', '?', '?', '?', '?'].join(',');

  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into config_keys (${columns}) values (${values});`,
        [
          s.id,
          s.config_key_id,
          JSON.stringify(s.data || {}),
          s.createdAt,
          s.updatedAt
        ],
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')(`ERROR: insertConfigKey - ${s.data.title || s.id}`, e);
            reject(e);
          }
        }
      );
    },
  );
});

export default (data = []) => new Promise((resolve, reject) => {
  data = data || [];

  if (!data.length) return resolve(null);

  Promise.all(data.map(s => query(s)))
    .then(rslts => resolve(rslts))
    .catch(reject);
});

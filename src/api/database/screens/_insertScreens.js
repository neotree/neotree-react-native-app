import db from '../db';

const query = s => new Promise((resolve, reject) => {
  const columns = ['id', 'screen_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');

  const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');

  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into screens (${columns}) values (${values});`,
        [
          s.id,
          s.screen_id,
          s.script_id,
          s.position,
          s.type,
          JSON.stringify(s.data || {}),
          s.createdAt,
          s.updatedAt
        ],
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')(`ERROR: insertScreen - ${s.data.title || s.id}`, e);
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
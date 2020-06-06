import db from '../db';

export default (options = {}) => new Promise((resolve, reject) => {
  const { ..._where } = options.payload || {};

  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'select * from logs';
  q = where ? `${q} where ${where}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q} order by createdAt DESC limit 1;`.trim(),
        null,
        (tx, rslts) => resolve(rslts.rows._array[0]),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getLastLog', e);
            reject(e);
          }
        }
      );
    }
  );
});

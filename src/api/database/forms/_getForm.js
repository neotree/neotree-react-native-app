import db from '../db';

export default (options = {}) => new Promise((resolve, reject) => {
  const { ..._where } = options.payload || {};

  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'select * from forms';
  q = where ? `${q} where ${where}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q} limit 1;`.trim(),
        null,
        (tx, rslts) => resolve({
          form: rslts.rows._array.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]
        }),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getForm', e);
            reject(e);
          }
        }
      );
    }
  );
});
import db from '../db';

export default (options = {}) => new Promise((resolve, reject) => {
  const { ..._where } = options || {};

  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'select * from ehr_session';
  q = where ? `${q} where ${where}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q} limit 1;`.trim(),
        null,
        (tx, rslts) => resolve({
          ehr_session: rslts.rows._array[0]
        }),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getEhrSession', e);
            reject(e);
          }
        }
      );
    }
  );
});

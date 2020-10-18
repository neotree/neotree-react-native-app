import db from '../db';
import _getSessions from './_getSessions'

export default  (data = {}) => new Promise((resolve, reject) => {
  const done = (err, rslts) => {
    if (err) return reject(err);

     return resolve(rslts);

  };

  const id = data.id;
  const param = JSON.stringify(data.data || '{}');

  db.transaction(
    tx => {
      tx.executeSql(
        `update sessions set data =? where id = ${id};`,
        param,
        (tx, rslts) => {
          done(null, rslts);
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

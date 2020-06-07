import db from '../db';

export default (data = {}) => new Promise((resolve, reject) => {
  const done = (err, rslts) => {
    if (err) return reject(err);
    resolve(rslts);
  };

  db.transaction(
    tx => {
      tx.executeSql(
        'insert into logs (name, createdAt) values (?, ?);',
        [data.name, new Date().toString()],
        (tx, rslts) => done(null, rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: insertLog', e);
            reject(e);
          }
        }
      );
    }
  );
});

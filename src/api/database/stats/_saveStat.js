import db from '../db';

export default (data = {}) => new Promise((resolve, reject) => {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const done = (err, rslts) => {
    if (err) return reject(err);
    resolve(rslts);
  };

  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into stats (${columns}) values (${values.map(() => '?').join(',')});`,
        values,
        (tx, rslts) => done(null, rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: saveStat', e);
            done(e);
          }
        }
      );
    },
  );
});

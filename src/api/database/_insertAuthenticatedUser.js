import db from './db';

export default (user = '') => new Promise((resolve, reject) => {
  const done = (err, rslts) => {
    if (err) return reject(err);
    resolve(rslts);
  };

  const details = (() => {
    try {
      return JSON.stringify(user);
    } catch (e) {
      return null;
    }
  })();

  db.transaction(
    tx => {
      tx.executeSql(
        'insert or replace into authenticated_user (id, details) values (?, ?);',
        [1, details],
        (tx, rslts) => done(null, rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: insertAuthenticatedUser', e);
            reject(e);
          }
        }
      );
    }
  );
});

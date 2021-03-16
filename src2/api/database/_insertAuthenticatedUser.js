import db from './db';

export default (user = null) => new Promise((resolve, reject) => {
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
        (tx, rslts) => resolve(rslts),
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

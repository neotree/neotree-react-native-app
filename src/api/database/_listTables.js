import db from './db';

export default () => new Promise((resolve, reject) => {
  db.transaction(
    tx => tx.executeSql(
      'select name from sqlite_master where type="table" and name not like "sqlite_%"',
      null,
      (tx, rslts) => resolve(rslts),
      (tx, e) => {
        if (e) {
          require('@/utils/logger')('ERROR: listTables', e);
          reject(e);
        }
      }
    )
  );
});

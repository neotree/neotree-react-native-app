import db from './db';

export default () => new Promise((resolve, reject) => {
  db.transaction(
    tx => tx.executeSql(
      'select name from sqllite_master where type="table" and name not like "sqlite_%"',
      null,
      (tx, rslts) => rslts && resolve(rslts),
      (tx, e) => e && reject(e)
    )
  );
});

import db from '../db';

export default () => new Promise((resolve, reject) => {
  const querys = [
    'select sql from sqlite_master where name = "scripts";',
    'select sql from sqlite_master where name = "screens";',
    'select sql from sqlite_master where name = "forms";',
  ].map(q => new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(
        q,
        null,
        (tx, rslts) => rslts && resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: createTablesIfNotExists', e);
            reject(e);
          }
        }
      )
    );
  }));

  Promise.all(querys)
    .then(rslts => resolve({
      scriptsTable: rslts[0],
      screensTable: rslts[0],
      formsTable: rslts[0],
    }))
    .catch(reject);
});

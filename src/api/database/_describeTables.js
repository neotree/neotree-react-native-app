import db from './db';

export default () => new Promise((resolve, reject) => {
  const querys = [
    'select sql from sqlite_master where name = "scripts";',
    'select sql from sqlite_master where name = "screens";',
    'select sql from sqlite_master where name = "forms";',
    'select sql from sqlite_master where name = "logs";',
    'select sql from sqlite_master where name = "authenticated_user";',
  ].map(q => new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(
        q,
        null,
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: describeTables', e);
            reject(e);
          }
        }
      )
    );
  }));

  Promise.all(querys)
    .then(rslts => resolve({
      scriptsTable: rslts[0],
      screensTable: rslts[1],
      formsTable: rslts[2],
      logsTable: rslts[3],
      authenticatedUserTable: rslts[4],
    }))
    .catch(reject);
});
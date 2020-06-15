import db from './db';

export default () => new Promise((resolve, reject) => {
  const querys = [
    'drop table if exists scripts;',
    'drop table if exists screens;',
    'drop table if exists sessions;',
    'drop table if exists authenticated_user;',
    'drop table if exists data_status;',
    'drop table if exists diagnoses;',
  ].map(q => new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(
        q,
        null,
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: dropTables', e);
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
      sessionsTable: rslts[2],
      authenticatedUserTable: rslts[3],
      dataStatusTable: rslts[3],
      diagnosesTable: rslts[3],
    }))
    .catch(reject);
});

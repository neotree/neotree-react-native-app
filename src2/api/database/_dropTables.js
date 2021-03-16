import db from './db';

export default () => new Promise((resolve, reject) => {
  const tables = [
    'data_status',
    'scripts',
    'screens',
    'diagnoses',
    'sessions',
    'authenticated_user',
    'config_keys',
    'configuration',
  ];
  const querys = tables.map(tableName => `drop table if exists ${tableName};`)
    .map(q => new Promise((resolve, reject) => {
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
    .then(rslts => resolve(tables.reduce((acc, tableName, i) => ({
      ...acc,
      [tableName]: rslts[i]
    }), {})))
    .catch(reject);
});

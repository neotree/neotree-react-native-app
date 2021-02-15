import db from '../db';

export default (info = {}) => new Promise((resolve, reject) => {
  const columns = ['id', 'version', 'last_sync_date', 'createdAt', 'updatedAt'].join(',');

  const values = ['?', '?', '?', '?', '?'].join(',');

  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into app_info (${columns}) values (${values});`,
        [
          1,
          info.version,
          info.last_sync_date,
          info.createdAt || new Date().toISOString(),
          new Date().toISOString()
        ],
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: saveAppInfo', e);
            reject(e);
          }
        }
      );
    },
  );
});

import db from '../db';

export default (data = {}) => new Promise((resolve, reject) => {
  db.transaction(
    tx => {
      tx.executeSql(
        'insert or replace into configuration (id, data, createdAt, updatedAt) values (?, ?, ?, ?);',
        [1, JSON.stringify(data || {}), new Date().toString(), new Date().toString()],
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: saveConfiguration', e);
            reject(e);
          }
        }
      );
    }
  );
});

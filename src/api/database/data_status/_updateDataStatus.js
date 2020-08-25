import db from '../db';

export default (data = {}, opts = {}) => new Promise((resolve, reject) => {
  const where = opts.where || {};

  data = { updatedAt: new Date().toISOString(), ...data };

  const _where = Object.keys(where).map(key => `${key}=${JSON.stringify(where[key])}`)
    .join(',');

  const set = Object.keys(data)
    .map(key => `${key}=?`)
    .join(',');

  db.transaction(
    tx => {
      tx.executeSql(
        `update data_status set ${set} where ${_where || 1};`,
        Object.values(data),
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: updateDataStatus', e);
            reject(e);
          }
        }
      );
    }
  );
});

import db from '../db';

export default (data = {}, opts = {}) => new Promise((resolve, reject) => {
  const where = opts.where || {};

  data = { updatedAt: new Date().toString(), ...data };

  const _where = Object.keys(where).map(key => `${key}=${JSON.stringify(where[key])}`)
    .join(',');

  const set = Object.keys(data)
    .map(key => `${key}=?`)
    .join(',');

  db.transaction(
    tx => {
      tx.executeSql(
        `update sessions set ${set} where ${_where || 1};`,
        Object.values(data),
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: Sessions', e);
            reject(e);
          }
        }
      );
    }
  );
});
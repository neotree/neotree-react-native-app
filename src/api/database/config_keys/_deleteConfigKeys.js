import db from '../db';

const deleteSession = (_where = {}) => new Promise((resolve, reject) => {
  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'delete from config_keys';
  q = where ? `${q} where ${where}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q};`.trim(),
        null,
        (tx, rslts) => resolve({ rslts }),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: deleteConfigKey', e);
            reject(e);
          }
        }
      );
    }
  );
});

export default (params = []) => new Promise((resolve, reject) => {
  params = params || [];

  if (!params.map) params = [params];

  Promise.all(params.map(where => deleteSession(where)))
    .catch(reject)
    .then(resolve);
});

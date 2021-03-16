import db from '../db';

const deleteSession = (_where = {}) => new Promise((resolve, reject) => {
  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'delete from sessions';
  q = where ? `${q} where ${where}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q};`.trim(),
        null,
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: deleteSession', e);
            reject(e);
          }
        }
      );
    }
  );
});

export default (ids = []) => new Promise((resolve, reject) => {
  ids = ids || [];

  if (!ids.map) ids = [ids];

  Promise.all(ids.map(id => ({ id })).map(where => deleteSession(where)))
    .catch(reject)
    .then(resolve);
});

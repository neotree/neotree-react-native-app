import db from './db';

export default (data = []) => new Promise((resolve, reject) => {
  data = data || [];

  if (!data.length) return resolve(null);

  const done = (err, rslts) => {
    if (err) return reject(err);
    resolve(rslts);
  };

  const columns = ['id', 'screen_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');

  const values = data.map(() => ['?', '?', '?', '?', '?', '?', '?', '?'])
    .map(values => values.join(','))
    .map(values => `(${values})`)
    .join(',');

  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into screens (${columns}) values ${values};`,
        data.reduce((acc, s) => [
          ...acc,
          s.id,
          s.screen_id,
          s.script_id,
          s.position,
          s.type,
          JSON.stringify(s.data || {}),
          s.createdAt,
          s.updatedAt
        ], []),
        (tx, rslts) => done(null, rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: insertScreens', e);
            reject(e);
          }
        }
      );
    }
  );
});

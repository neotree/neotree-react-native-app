import db from './db';

export default (data = []) => new Promise((resolve, reject) => {
  data = data || [];

  if (!data.length) return resolve(null);

  const columns = ['id', 'screen_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
  const values = data.map(item => [item.id, item.screen_id, item.script_id, item.position, item.type, JSON.stringify({}), item.createdAt, item.updatedAt])
    .map(values => values.map(v => JSON.stringify(v)).join(','))
    .map(values => `(${values})`)
    .join(',')
    .trim();

  db.transaction(
    tx => tx.executeSql(
      `insert or replace into screens (${columns}) values ${values};`,
      null,
      (tx, rslts) => rslts && resolve(rslts),
      (tx, e) => e && reject(e)
    )
  );
});

import db from './db';

export default (data = []) => new Promise((resolve, reject) => {
  data = data || [];

  if (!data.length) return resolve(null);

  const columns = ['id', 'data', 'createdAt', 'updatedAt'].join(',');
  const values = data.map(item => [item.id, JSON.stringify({}), item.createdAt, item.updatedAt])
    .map(values => values.map(v => JSON.stringify(v)).join(','))
    .map(values => `(${values})`)
    .join(',')
    .trim();

  db.transaction(
    tx => tx.executeSql(
      `insert or replace into scripts (${columns}) values ${values};`,
      null,
      (tx, rslts) => rslts && resolve(rslts),
      (tx, e) => e && reject(e)
    )
  );
});

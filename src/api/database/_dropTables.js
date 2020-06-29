import db from './db';

export default () => new Promise((resolve, reject) => {
  const querys = [
    'drop table scripts;',
    'drop table screens;',
    'drop table forms;',
  ].map(q => new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(
        q,
        null,
        (tx, rslts) => rslts && resolve(rslts),
        (tx, e) => e && reject(e)
      )
    );
  }));

  Promise.all(querys)
    .then(rslts => resolve({
      scriptsTable: rslts[0],
      screensTable: rslts[0],
      formsTable: rslts[0],
    }))
    .catch(reject);
});

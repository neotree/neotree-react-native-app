import db from './db';

export default () => new Promise((resolve, reject) => {
  const querys = [
    'create table if not exists scripts (id varchar primary key not null, script_id varchar, data text, createdAt datetime, updatedAt datetime);',
    'create table if not exists screens (id integer primary key not null, script_id varchar, position integer, screen_id varchar, type varchar, data text, createdAt datetime, updatedAt datetime);',
    'create table if not exists forms (id integer primary key not null, script_id varchar, data text, completed boolean, exported boolean, createdAt datetime, updatedAt datetime);',
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
      screensTable: rslts[1],
      formsTable: rslts[2],
    }))
    .catch(reject);
});

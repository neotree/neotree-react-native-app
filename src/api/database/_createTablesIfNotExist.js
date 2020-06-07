import db from './db';

export default () => new Promise((resolve, reject) => {
  const scriptsTableColumns = [
    'id varchar primary key not null',
    'script_id varchar',
    'data text',
    'createdAt datetime',
    'updatedAt datetime'
  ].join(',');

  const screensTableColumns = [
    'id integer primary key not null',
    'script_id varchar',
    'screen_id varchar',
    'position integer',
    'type varchar',
    'data text',
    'createdAt datetime',
    'updatedAt datetime'
  ].join(',');

  const formsTableColumns = [
    'id integer primary key not null',
    'script_id varchar',
    'data text',
    'completed boolean',
    'exported boolean',
    'createdAt datetime',
    'updatedAt datetime'
  ].join(',');

  const authenticatedUserTableColumns = [
    'id integer primary key not null',
    'authenticated boolean',
    'details text'
  ].join(',');

  const logsTableColumns = [
    'id integer primary key not null',
    'name string',
    'createdAt datetime'
  ].join(',');

  const querys = [
    `create table if not exists scripts (${scriptsTableColumns});`,
    `create table if not exists screens (${screensTableColumns});`,
    `create table if not exists forms (${formsTableColumns});`,
    `create table if not exists logs (${logsTableColumns});`,
    `create table if not exists authenticated_user (${authenticatedUserTableColumns});`,
  ].map(q => new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(
        q,
        null,
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: createTablesIfNotExists', e);
            reject(e);
          }
        }
      )
    );
  }));

  Promise.all(querys)
    .then(rslts => resolve({
      scriptsTable: rslts[0],
      screensTable: rslts[1],
      formsTable: rslts[2],
      usersTable: rslts[3]
    }))
    .catch(reject);
});

import db from './db';

export default () => new Promise((resolve, reject) => {
  const dataStatusTable = [
    'id varchar primary key not null',
    'unique_key varchar',
    'device_id integer',
    'data_initialised boolean',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

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

  const querys = [
    `create table if not exists data_status (${dataStatusTable});`,
    `create table if not exists scripts (${scriptsTableColumns});`,
    `create table if not exists screens (${screensTableColumns});`,
    `create table if not exists forms (${formsTableColumns});`,
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
      dataStatusTable: rslts[0],
      scriptsTable: rslts[1],
      screensTable: rslts[2],
      formsTable: rslts[3],
      authenticatedUserTable: rslts[4]
    }))
    .catch(reject);
});
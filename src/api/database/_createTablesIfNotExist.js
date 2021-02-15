import db from './db';

export default () => new Promise((resolve, reject) => {
  const appInfoTableColumns = [
    'id varchar primary key not null',
    'version integer',
    'last_sync_date datetime',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const dataStatusTableColumns = [
    'id varchar primary key not null',
    'uid_prefix varchar',
    'user_id varchar',
    'unique_key varchar',
    'device_id integer',
    'data_initialised boolean',
    'last_sync_date datetime',
    'total_sessions_recorded integer',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const scriptsTableColumns = [
    'id varchar primary key not null',
    'script_id varchar',
    'position integer',
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

  const diagnosesTableColumns = [
    'id integer primary key not null',
    'script_id varchar',
    'diagnosis_id varchar',
    'position integer',
    'type varchar',
    'data text',
    'createdAt datetime',
    'updatedAt datetime'
  ].join(',');

  const sessionsTableColumns = [
    'id integer primary key not null',
    'script_id varchar',
    'uid varchar',
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

  const config_keysTableColumns = [
    'id varchar primary key not null',
    'config_key_id varchar',
    'position integer',
    'data text',
    'createdAt datetime',
    'updatedAt datetime'
  ].join(',');

  const configurationTableColumns = [
    'id varchar primary key not null',
    'data text',
    'createdAt datetime',
    'updatedAt datetime'
  ].join(',');

  const querys = [
    `create table if not exists app_info (${appInfoTableColumns});`,
    `create table if not exists data_status (${dataStatusTableColumns});`,
    `create table if not exists scripts (${scriptsTableColumns});`,
    `create table if not exists screens (${screensTableColumns});`,
    `create table if not exists diagnoses (${diagnosesTableColumns});`,
    `create table if not exists sessions (${sessionsTableColumns});`,
    `create table if not exists authenticated_user (${authenticatedUserTableColumns});`,
    `create table if not exists config_keys (${config_keysTableColumns});`,
    `create table if not exists configuration (${configurationTableColumns});`,
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
      appInfoTable: rslts[0],
      dataStatusTable: rslts[1],
      scriptsTable: rslts[2],
      screensTable: rslts[3],
      diagnosesTable: rslts[4],
      sessionsTable: rslts[5],
      authenticatedUserTable: rslts[6],
      config_keysTable: rslts[7],
      configurationTable: rslts[8],
    }))
    .catch(reject);
});

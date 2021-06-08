import config from '@/constants/config';
import { dbTransaction } from './db';

const { countries } = config;

export default () => new Promise((resolve, reject) => {
  const applicationTableColumns = [
    'id integer primary key not null',
    'version varchar not null',
    'device_id varchar not null',
    'uid_prefix varchar not null',
    'mode varchar not null',
    'last_sync_date datetime',
    'total_sessions_recorded integer',
    'webeditor_info text',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const scriptsTableColumns = [
    'id varchar primary key not null',
    'script_id varchar',
    'type varchar',
    'position integer',
    'data text',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const screensTableColumns = [
    'id integer primary key not null',
    'script_id varchar',
    'screen_id varchar',
    'position integer',
    'type varchar',
    'data text',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const diagnosesTableColumns = [
    'id integer primary key not null',
    'script_id varchar',
    'diagnosis_id varchar',
    'position integer',
    'type varchar',
    'data text',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const sessionsTableColumns = [
    'id integer primary key not null',
    'session_id integer',
    'script_id varchar',
    'type varchar',
    'uid varchar',
    'data text',
    'completed boolean',
    'exported boolean',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const exportsTableColumns = [
    'id integer primary key not null',
    'session_id integer not null',
    'uid varchar',
    'scriptid varchar',
    'data text',
    'ingested_at datetime',
  ].join(',');

  const authenticatedUserTableColumns = [
    'id integer primary key not null',
    'authenticated boolean',
    'details text',
  ].join(',');

  const config_keysTableColumns = [
    'id varchar primary key not null',
    'config_key_id varchar',
    'position integer',
    'data text',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const configurationTableColumns = [
    'id varchar primary key not null',
    'data text',
    'createdAt datetime',
    'updatedAt datetime',
  ].join(',');

  const locationTableColumns = [
    'id integer primary key not null',
    'country varchar',
    'hospital varchar',
  ].join(',');

  const queries = ['main', ...countries].reduce((acc, dbName) => [
    ...acc,
    ...[
      `create table if not exists application (${applicationTableColumns});`,
      `create table if not exists scripts (${scriptsTableColumns});`,
      `create table if not exists screens (${screensTableColumns});`,
      `create table if not exists diagnoses (${diagnosesTableColumns});`,
      `create table if not exists sessions (${sessionsTableColumns});`,
      `create table if not exists authenticated_user (${authenticatedUserTableColumns});`,
      `create table if not exists config_keys (${config_keysTableColumns});`,
      `create table if not exists configuration (${configurationTableColumns});`,
      `create table if not exists location (${locationTableColumns});`,
      `create table if not exists exports (${exportsTableColumns});`,
    ].map(q => dbTransaction(q, null, dbName))
  ], []);

  Promise.all(queries)
    .then(rslts => resolve(rslts))
    .catch(reject);
});


import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('db.db');

export const dbTransaction = (q: string, data: any = null, cb?: (e: any, rslts?: any) => void) => new Promise<any[]>((resolve, reject) => {
    const done = (error?: null | Error, data?: any[]) => {
        if (error) {
            reject(error);
        } else {
            resolve(data || []);
        }
        cb?.(error, data);
    };
    db.getAllAsync<any>(q, data)
        .then(res => done(null, res))
        .catch(done);
});

export async function createTablesIfNotExist() {
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

    const drugs_libraryTableColumns = [
        'id varchar primary key not null',
        'item_id varchar',
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

    const exceptionTableColumns = [
        'id integer primary key not null',
        'country varchar',
        'message varchar',
        'stack varchar',
        'device varchar',
        'exported boolean',
        'hospital varchar',
        'version varchar',
        'battery varchar',
        'device_model varchar',
        'memory varchar',
        'editor_version varchar'
    ].join(',');

    const aliasesTableColumns = [
    'id INTEGER PRIMARY KEY AUTOINCREMENT',
    'scriptid TEXT',
    'old_script TEXT',
    'alias TEXT',
    'name TEXT',
    'UNIQUE(scriptid, name)'   
    ].join(',');

    return await Promise.all([
        //DROP OLD ALIASES TABLE IF EXISTS IN FAVOR OF nt_aliases
        dbTransaction(`drop table if exists aliases;`),
        dbTransaction(`create table if not exists application (${applicationTableColumns});`),
        dbTransaction(`create table if not exists scripts (${scriptsTableColumns});`),
        dbTransaction(`create table if not exists screens (${screensTableColumns});`),
        dbTransaction(`create table if not exists diagnoses (${diagnosesTableColumns});`),
        dbTransaction(`create table if not exists sessions (${sessionsTableColumns});`),
        dbTransaction(`create table if not exists authenticated_user (${authenticatedUserTableColumns});`),
        dbTransaction(`create table if not exists config_keys (${config_keysTableColumns});`),
        dbTransaction(`create table if not exists drugs_library (${drugs_libraryTableColumns});`),
        dbTransaction(`create table if not exists configuration (${configurationTableColumns});`),
        dbTransaction(`create table if not exists location (${locationTableColumns});`),
        dbTransaction(`create table if not exists exports (${exportsTableColumns});`),
        dbTransaction(`create table if not exists exceptions (${exceptionTableColumns});`),
        dbTransaction(`create table if not exists nt_aliases (${aliasesTableColumns});`),
    ]);
}
 export const addNewColumns = async()=>{
 //ADD COLUMNS TO SESSIONS TABLE
  const sessionsTableInfo = await dbTransaction(`PRAGMA table_info(sessions);`);
  if(sessionsTableInfo && sessionsTableInfo.length>0){
     const localExportExists = sessionsTableInfo.some((col: any) => col.name === 'local_export');
     if(!localExportExists){
          await dbTransaction(`ALTER TABLE sessions ADD COLUMN local_export BOOLEAN DEFAULT 0;`);

     }
  }
}

export const resetTables = async () => {
    await createTablesIfNotExist();
    return await Promise.all([
        // 'delete * from application where 1;',
        'delete * from scripts where 1;',
        'delete * from screens where 1;',
        'delete * from diagnoses where 1;',
        // 'delete * from sessions where 1;',
        // 'delete * from authenticated_user where 1;',
        'delete * from config_keys where 1;',
        'delete * from drugs_library where 1;',
        'delete * from configuration where 1;',
        // 'delete * from location where 1;',
        // 'delete * from exports where 1;',
    ].map(q => dbTransaction(q))); 
};
export const resetApp = async () => {
    await Promise.all([
        dbTransaction(`drop table if exists application;`),
        dbTransaction(`drop table if exists scripts;`),
        dbTransaction(`drop table if exists screens;`),
        dbTransaction(`drop table if exists diagnoses;`),
        dbTransaction(`drop table if exists sessions;`),
        dbTransaction(`drop table if exists authenticated_user ;`),
        dbTransaction(`drop table if exists config_keys;`),
        dbTransaction(`drop table if exists drugs_library;`),
        dbTransaction(`drop table if exists configuration;`),
        dbTransaction(`drop table if exists location;`),
        dbTransaction(`drop table if exists exports;`),
        dbTransaction(`drop table if exists exceptions;`),
        dbTransaction(`drop table if exists aliases;`),
    ]); 
    await createTablesIfNotExist();
};

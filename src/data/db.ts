
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

    return await Promise.all([
        dbTransaction(`create table if not exists application (${applicationTableColumns});`),
        dbTransaction(`create table if not exists scripts (${scriptsTableColumns});`),
        dbTransaction(`create table if not exists screens (${screensTableColumns});`),
        dbTransaction(`create table if not exists diagnoses (${diagnosesTableColumns});`),
        dbTransaction(`create table if not exists sessions (${sessionsTableColumns});`),
        dbTransaction(`create table if not exists authenticated_user (${authenticatedUserTableColumns});`),
        dbTransaction(`create table if not exists config_keys (${config_keysTableColumns});`),
        dbTransaction(`create table if not exists configuration (${configurationTableColumns});`),
        dbTransaction(`create table if not exists location (${locationTableColumns});`),
        dbTransaction(`create table if not exists exports (${exportsTableColumns});`),
        dbTransaction(`create table if not exists exceptions (${exceptionTableColumns});`),
    ]);
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
        'delete * from configuration where 1;',
        // 'delete * from location where 1;',
        // 'delete * from exports where 1;',
    ].map(q => dbTransaction(q))); 
};
export const resetApp = async () => {
    await Promise.all([
        dbTransaction(`drop table application;`),
        dbTransaction(`drop table scripts;`),
        dbTransaction(`drop table screens;`),
        dbTransaction(`drop table diagnoses;`),
        dbTransaction(`drop table sessions;`),
        dbTransaction(`drop table authenticated_user ;`),
        dbTransaction(`drop table config_keys;`),
        dbTransaction(`drop table configuration;`),
        dbTransaction(`drop table location;`),
        dbTransaction(`drop table exports;`),
        dbTransaction(`drop table exceptions;`),
    ]); 
    await createTablesIfNotExist();
};

import * as SQLite from 'expo-sqlite';
var openDatabase = require('websql/custom');

export const db = SQLite.openDatabase('db.db') || openDatabase('db.db', '2.0', 'description', 1);

export const dbTransaction = (q: string, data: any = null, cb?: (e: any, rslts?: any) => void) => new Promise<any[]>((resolve, reject) => {
    db.transaction(
        tx => {
            tx.executeSql(
                q,
                data,
                (_, rslts) => {
					if (cb) cb(null, rslts);
                    resolve(rslts.rows._array);
                },
                (_, e) => { 
					if (cb) cb(e);
                    reject(e); 
                    return true; 
                }
            );
        },
    );
});

export const webSqlDbTransaction= (q: string, args: any = [])=>new Promise<any[]> ((resolve,reject)=>{
    db.transaction(function(t) {
        t.executeSql(q, args,(error: any, results: any)=>{
            if(Object.keys(error).length==0){
                resolve(Array.from(results.rows))
            }else{
                reject(error)
            }
        });
    })
})

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

    return await Promise.all([
        webSqlDbTransaction(`create table if not exists application (${applicationTableColumns});`),
        webSqlDbTransaction(`create table if not exists scripts (${scriptsTableColumns});`),
        webSqlDbTransaction(`create table if not exists screens (${screensTableColumns});`),
        webSqlDbTransaction(`create table if not exists diagnoses (${diagnosesTableColumns});`),
        webSqlDbTransaction(`create table if not exists sessions (${sessionsTableColumns});`),
        webSqlDbTransaction(`create table if not exists authenticated_user (${authenticatedUserTableColumns});`),
        webSqlDbTransaction(`create table if not exists config_keys (${config_keysTableColumns});`),
        webSqlDbTransaction(`create table if not exists configuration (${configurationTableColumns});`),
        webSqlDbTransaction(`create table if not exists location (${locationTableColumns});`),
        webSqlDbTransaction(`create table if not exists exports (${exportsTableColumns});`),
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
    ].map(q => webSqlDbTransaction(q))); 
};

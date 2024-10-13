import * as SQLite from 'expo-sqlite';

import logger from '@/lib/logger';

export async function getDB() {
    try {
        const db = await SQLite.openDatabaseAsync('db.db');
       return db;
    } catch(e: any) {
        logger.error('getDB ERROR: ', e.message);
        throw e;
    }
}

export async function dbTransaction<DataType = any>(
    sql: string, 
    variables: any[] = []
) {
    try {
        const db = await getDB();
        const results = await db.getAllAsync(sql, ...variables);
        return results as DataType[];
    } catch(e: any) {
        logger.error('dbTransaction ERROR: ', sql, e.message);
        throw e;
    }
}

export async function initDB() {
    try {
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
    
        await Promise.all([
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
    } catch(e: any) {
        logger.error('initDB ERROR', e.message);
        throw e;
    }
}

import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { createTablesIfNotExist, dbTransaction } from './db';
import queryString from 'query-string';
import { makeApiCall } from './api';
import { getApplication, getAuthenticatedUser } from './queries';

const APP_VERSION = Constants.manifest?.version;

export async function syncData(opts?: { force?: boolean; }) {  
    const networkState = await NetInfo.fetch();

    await createTablesIfNotExist();

    const authenticatedUser = await getAuthenticatedUser();

    let deviceId = null;
    if (Platform.OS === 'android') {
        deviceId = Application.androidId;
    } else {
        deviceId = await Application.getIosIdForVendorAsync();
    }

    let last_sync_date = null;

    if (authenticatedUser && networkState?.isInternetReachable) {
        const deviceReg = await makeApiCall('webeditor', `/get-device-registration?deviceId=${deviceId}`);
        const deviceRegJSON = await deviceReg.json();

        const app = await getApplication();

        last_sync_date = app?.last_sync_date;

        const shouldSync = opts?.force || 
            (app?.mode === 'development') ||
            !((app?.mode === 'production') && (deviceRegJSON?.info?.version === app?.webeditor_info?.version));

        if (shouldSync) {
            last_sync_date = new Date().toISOString();

            const res = await makeApiCall(
                'webeditor',
                `/sync-data?${queryString.stringify({ deviceId, })}`,
            );
            const json = await res.json();
    
            const webeditorInfo = json?.webeditorInfo || {};
            const device = json?.device || {};
            const configKeys = json?.configKeys || [];
            const scripts = json?.scripts || [];
            const screens = json?.screens || [];
            const diagnoses = json?.diagnoses || [];
            
            await Promise.all(['scripts', 'screens', 'diagnoses', 'config_keys'].map(table => dbTransaction(
                `delete from ${table} where 1;`
            )));

            const promises: Promise<any>[] = [];

            configKeys.map((s: any) => {
                const columns = ['id', 'config_key_id', 'data', 'createdAt', 'updatedAt'].join(',');
                const values = ['?', '?', '?', '?', '?'].join(',');
                return dbTransaction(`insert or replace into config_keys (${columns}) values (${values});`, [
                    s.id,
                    s.config_key_id,
                    JSON.stringify(s.data || {}),
                    s.createdAt,
                    s.updatedAt
                ]);
            });

            scripts.map((s: any) => {
                s.data = { ...s.data };
                const columns = ['id', 'script_id', 'type', 'data', 'position', 'createdAt', 'updatedAt'].join(',');
                const values = ['?', '?', '?', '?', '?', '?', '?'].join(',');
                promises.push(dbTransaction(`insert or replace into scripts (${columns}) values (${values});`, [
                    s.id,
                    s.script_id,
                    s.type || s.data.type,
                    JSON.stringify(s.data),
                    s.position,
                    s.createdAt,
                    s.updatedAt
                ]));
            });

            screens.map((s: any) => {
                const columns = ['id', 'screen_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
                const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
                promises.push(dbTransaction(`insert or replace into screens (${columns}) values (${values});`, [
                    s.id,
                    s.screen_id,
                    s.script_id,
                    s.position,
                    s.type,
                    JSON.stringify(s.data || {}),
                    s.createdAt,
                    s.updatedAt
                ]));
            });

            diagnoses.map((s: any) => {
                const columns = ['id', 'diagnosis_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
                const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
                promises.push(dbTransaction(`insert or replace into diagnoses (${columns}) values (${values});`, [
                    s.id,
                    s.diagnosis_id,
                    s.script_id,
                    s.position,
                    s.type,
                    JSON.stringify(s.data || {}),
                    s.createdAt,
                    s.updatedAt
                ]));
            });

            const getApplicationRslt = await dbTransaction('select * from application where id=1;');
            const _application = getApplicationRslt[0];

            let application = {
                id: 1,
                mode: _application?.mode || 'production',
                last_sync_date,
                uid_prefix: _application?.uid_prefix || device?.device_hash,
                total_sessions_recorded: Math.max(_application?.total_sessions_recorded || 0, device?.details?.scripts_count || 0),
                device_id: _application?.device_id || device?.device_id || deviceId,
                webeditor_info: JSON.stringify(webeditorInfo),
                createdAt: _application?.createdAt || new Date().toISOString(),            
                version: APP_VERSION,
                updatedAt: new Date().toISOString(),
            };

            await dbTransaction(
                `insert or replace into application (${Object.keys(application).join(',')}) values (${Object.keys(application).map(() => '?').join(',')});`,
                Object.values(application)
            );

            await Promise.all(promises);
        }
    }

    const _app = await getApplication();

    return { 
        authenticatedUser, 
        application: _app,
        last_sync_date,
    };
}  

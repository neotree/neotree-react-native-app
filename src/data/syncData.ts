// import * as Network from 'expo-network';
import NetInfo from '@react-native-community/netinfo';
import queryString from 'query-string';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { APP_VERSION } from '@/src/constants';
import { getDeviceID } from '@/src/utils/getDeviceID';
import { dbTransaction, ensureSchema, db } from './db';
import { makeApiCall, reportErrors, SYNC_DOWNLOAD_TIMEOUT_MS, REMOTE_PROBE_TIMEOUT_MS } from './api';
import { getApplication, getAuthenticatedUser, getExceptions, getLocation } from './queries';
import { ASYNC_STORAGE_KEYS } from '../constants/async-storage';

export async function syncData(opts?: { force?: boolean; }) {
	const netInfo = await NetInfo.fetch();
    // const networkState = await Network.getNetworkStateAsync();

    await ensureSchema();

    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.SYNC_ERROR);

    const authenticatedUser = await getAuthenticatedUser();

    const deviceId = await getDeviceID();

    let last_sync_date = null;

    const knownOffline = netInfo?.isConnected === false || netInfo?.isInternetReachable === false;
    const shouldAttempt = Boolean(authenticatedUser) && !knownOffline;

    if (opts?.force && !shouldAttempt) {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SYNC_ERROR, 'Failed to connect to sync');
        throw new Error(
            authenticatedUser
                ? 'No internet connection. Connect to a network and try again.'
                : 'You must be signed in to sync.'
        );
    }

	// if (authenticatedUser && networkState?.isConnected && networkState?.isInternetReachable) {
    if (shouldAttempt) {
        const app = await getApplication();

        last_sync_date = app?.last_sync_date;

        let webUpdated = false;
        let versionUpdated = false;
        let probeSucceeded = false;

        try {
            const deviceReg = await makeApiCall(
                'webeditor',
                `/get-device-registration?deviceId=${deviceId}`,
                undefined,
                { timeout: REMOTE_PROBE_TIMEOUT_MS },
            );
            if (!deviceReg.ok) throw new Error(`get-device-registration failed with status ${deviceReg.status}`);
            const deviceRegJSON = await deviceReg.json();
            probeSucceeded = true;

            webUpdated = deviceRegJSON?.info?.last_backup_date &&
                last_sync_date &&
                (new Date(deviceRegJSON?.info?.last_backup_date).getTime() !== new Date(last_sync_date).getTime());

            last_sync_date = deviceRegJSON?.info?.last_backup_date;

            versionUpdated = deviceRegJSON?.info?.version !== app?.webeditor_info?.version;
        } catch(e: any) {
            if (!app?.webeditor_info?.version) throw new Error(e);
            AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SYNC_ERROR, 'Failed to connect to sync');
        }

        let shouldSync = probeSucceeded && (opts?.force || versionUpdated || webUpdated);

        if (opts?.force && !probeSucceeded) {
            throw new Error('Failed to connect to sync');
        }

        if (shouldSync) {
            try{
                const location = await getLocation();

                last_sync_date = last_sync_date ? new Date(last_sync_date).toISOString() : new Date().toISOString();

                const res = await makeApiCall(
                    'webeditor',
                    `/sync-data?${queryString.stringify({ deviceId, hospitalId: location?.hospital, })}`,
                    undefined,
                    { timeout: SYNC_DOWNLOAD_TIMEOUT_MS },
                );

                if (!res.ok) throw new Error(`sync-data request failed with status ${res.status}`);
                const json = await res.json();

                const requiredKeys = ['webeditorInfo', 'device', 'configKeys', 'drugsLibrary', 'scripts', 'screens', 'diagnoses', 'problems'];
                const hasValidShape = json && typeof json === 'object' && !Array.isArray(json)
                    && requiredKeys.every(key => key in json);
                if (!hasValidShape) throw new Error('sync-data response has an unexpected shape');

                const webeditorInfo = json.webeditorInfo || {};
                const device = json.device || {};
                const configKeys = json.configKeys || [];
                const drugsLibrary = json.drugsLibrary || [];
                const scripts = json.scripts || [];
                const screens = json.screens || [];
                const diagnoses = json.diagnoses || [];
                const problems = json.problems || [];
                const aliasesData = Array.isArray(json.aliases?.data) ? json.aliases.data : null;

                const getApplicationRslt = await dbTransaction('select * from application where id=1;');
                const _application = getApplicationRslt[0];

                const application = {
                    id: 1,
                    mode: _application?.mode || 'production',
                    last_sync_date,
                    uid_prefix: _application?.uid_prefix || device?.device_hash||'FB8E',
                    total_sessions_recorded: Math.max(_application?.total_sessions_recorded || 0, device?.details?.scripts_count || 0),
                    device_id: _application?.device_id || device?.device_id || deviceId,
                    webeditor_info: JSON.stringify(webeditorInfo),
                    createdAt: _application?.createdAt || new Date().toISOString(),
                    version: APP_VERSION,
                    updatedAt: new Date().toISOString(),
                };

                // Replace-everything is all-or-nothing: if any part of the bulk download/validation/transaction fails, the local db is left unchanged. The exclusive transaction below ensures that no other db operations can interleave with this one.
                await db.withExclusiveTransactionAsync(async (txn: any) => {
                    const tablesToReplace = ['scripts', 'screens', 'diagnoses', 'problems', 'config_keys', 'drugs_library'];

                    if (aliasesData) tablesToReplace.push('nt_aliases');
                    await Promise.all(tablesToReplace.map(table => dbTransaction(
                        `delete from ${table} where 1;`, null, undefined, txn
                    )));

                    const writes: Promise<any>[] = [];

                    configKeys.forEach((s: any) => {
                        const columns = ['id', 'config_key_id', 'data', 'createdAt', 'updatedAt'].join(',');
                        const values = ['?', '?', '?', '?', '?'].join(',');
                        writes.push(dbTransaction(`insert or replace into config_keys (${columns}) values (${values});`, [
                            s.id,
                            s.config_key_id,
                            JSON.stringify(s.data || {}),
                            s.createdAt,
                            s.updatedAt
                        ], undefined, txn));
                    });

                    drugsLibrary.forEach((s: any) => {
                        const columns = ['id', 'item_id', 'data', 'createdAt', 'updatedAt'].join(',');
                        const values = ['?', '?', '?', '?', '?'].join(',');
                        writes.push(dbTransaction(`insert or replace into drugs_library (${columns}) values (${values});`, [
                            s.id,
                            s.itemId,
                            JSON.stringify(s || {}),
                            s.createdAt,
                            s.updatedAt
                        ], undefined, txn));
                    });

                    scripts.forEach((s: any) => {
                        s.data = { ...s.data };
                        const columns = ['id', 'script_id', 'type', 'data', 'position', 'createdAt', 'updatedAt'].join(',');
                        const values = ['?', '?', '?', '?', '?', '?', '?'].join(',');
                        writes.push(dbTransaction(`insert or replace into scripts (${columns}) values (${values});`, [
                            s.id,
                            s.script_id,
                            s.type || s.data.type,
                            JSON.stringify(s.data),
                            s.position,
                            s.createdAt,
                            s.updatedAt
                        ], undefined, txn));
                    });
                    (aliasesData || []).forEach((s: any) => {
                        const columns = ['scriptid', 'old_script', 'alias', 'name'].join(',');
                        const values = ['?', '?', '?', '?'].join(',');
                        writes.push(dbTransaction(`insert or replace into nt_aliases (${columns}) values (${values});`, [
                            s.script,
                            s.oldScript,
                            s.alias,
                            s.name
                        ], undefined, txn));
                    });

                    screens.forEach((s: any) => {
                        const columns = ['id', 'screen_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
                        const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
                        writes.push(dbTransaction(`insert or replace into screens (${columns}) values (${values});`, [
                            s.id,
                            s.screen_id,
                            s.script_id,
                            s.position,
                            s.type,
                            JSON.stringify(s.data || {}),
                            s.createdAt,
                            s.updatedAt
                        ], undefined, txn));
                    });

                    diagnoses.forEach((s: any) => {
                        const columns = ['id', 'diagnosis_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
                        const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
                        writes.push(dbTransaction(`insert or replace into diagnoses (${columns}) values (${values});`, [
                            s.id,
                            s.diagnosis_id,
                            s.script_id,
                            s.position,
                            s.type,
                            JSON.stringify(s.data || {}),
                            s.createdAt,
                            s.updatedAt
                        ], undefined, txn));
                    });

                    problems.forEach((s: any) => {
                        const columns = ['id', 'problem_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
                        const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
                        writes.push(dbTransaction(`insert or replace into problems (${columns}) values (${values});`, [
                            s.id,
                            s.problem_id,
                            s.script_id,
                            s.position,
                            s.type,
                            JSON.stringify(s.data || {}),
                            s.createdAt,
                            s.updatedAt
                        ], undefined, txn));
                    });

                    await Promise.all(writes);

                    await dbTransaction(
                        `insert or replace into application (${Object.keys(application).join(',')}) values (${Object.keys(application).map(() => '?').join(',')});`,
                        Object.values(application),
                        undefined,
                        txn
                    );
                });

                const exeptions = await getExceptions();
                if(exeptions){
                    for (let ex of exeptions){
                    await makeApiCall('nodeapi', `/exceptions`, {
                            method: 'POST',
                            body: JSON.stringify({
                                ...ex,
                                deviceId,
                                deviceHash: application.uid_prefix,
                            }),
                        }).then(async()=>{
                            ex.exported = true
                            await dbTransaction(
                                `insert or replace into exceptions (${Object.keys(ex).join(',')}) values (${Object.keys(ex).map(() => '?').join(',')});`,
                                Object.values(ex)
                            );

                        }).catch(() => {})

                    }
                }
            } catch(e: any) {
                console.log('syncData', e)
                reportErrors('syncData', e.message);
                AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SYNC_ERROR, 'Failed to connect to sync');

                if (opts?.force || !app?.webeditor_info?.version) throw new Error(e);
            }
        }
    }

    const _app = await getApplication();

    return {
        authenticatedUser,
        application: _app,
        last_sync_date,
    };
}

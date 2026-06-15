// import * as Network from 'expo-network';
import NetInfo from '@react-native-community/netinfo';
import queryString from 'query-string';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { APP_VERSION } from '@/src/constants';
import { getDeviceID } from '@/src/utils/getDeviceID';
import { createTablesIfNotExist, dbTransaction,addNewColumns } from './db';
import { getMobileDeviceHeaders, getUpdatePolicy, makeApiCall, reportErrors } from './api';
import { getApplication, getAuthenticatedUser, getExceptions, getLocation } from './queries';
import { ASYNC_STORAGE_KEYS } from '../constants/async-storage';
import { recordUpdateEvent } from '../update/otaTelemetry';

export async function syncData(opts?: { force?: boolean; }) {
	const netInfo = await NetInfo.fetch();
    // const networkState = await Network.getNetworkStateAsync();

    await createTablesIfNotExist();
    await addNewColumns();

    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.SYNC_ERROR);

    const authenticatedUser = await getAuthenticatedUser();

    const deviceId = await getDeviceID();

    let last_sync_date = null;

	// if (authenticatedUser && networkState?.isConnected && networkState?.isInternetReachable) {
    if (authenticatedUser && netInfo?.isConnected && netInfo?.isInternetReachable) {
        const app = await getApplication();

        last_sync_date = app?.last_sync_date;

        let webUpdated = false;
        let versionUpdated = false;

        try {
            // Sign the re-fetch so the server will return the device secret on the
            // recovery path (#2). On first enrollment the device has no secret yet;
            // the server issues + returns it regardless of signature.
            const deviceRegEndpoint = `/get-device-registration?deviceId=${deviceId}`;
            const deviceReg = await makeApiCall('webeditor', deviceRegEndpoint, {
                headers: await getMobileDeviceHeaders({ method: 'GET', endpoint: deviceRegEndpoint }),
            });
            const deviceRegJSON = await deviceReg.json();
            if (deviceRegJSON?.device?.device_auth_secret) {
                await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.DEVICE_AUTH_SECRET, deviceRegJSON.device.device_auth_secret);
                if (deviceRegJSON.device.device_auth_secret_rotated_at) {
                    await AsyncStorage.setItem(
                        ASYNC_STORAGE_KEYS.DEVICE_AUTH_SECRET_ROTATED_AT,
                        deviceRegJSON.device.device_auth_secret_rotated_at,
                    );
                }
            }

            webUpdated = deviceRegJSON?.info?.last_backup_date &&
                last_sync_date &&
                (new Date(deviceRegJSON?.info?.last_backup_date).getTime() !== new Date(last_sync_date).getTime());

            last_sync_date = deviceRegJSON?.info?.last_backup_date;

            versionUpdated = deviceRegJSON?.info?.version !== app?.webeditor_info?.version;
        } catch(e: any) {
            if (!app?.webeditor_info?.version) throw new Error(e);
            AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SYNC_ERROR, 'Failed to connect to sync');
        }

        let shouldSync = opts?.force || versionUpdated || webUpdated;

        // shouldSync = true;

        if (shouldSync) {
            try{
                const location = await getLocation();

                last_sync_date = last_sync_date ? new Date(last_sync_date).toISOString() : new Date().toISOString();

                const syncPromise = makeApiCall(
                    'webeditor',
                    `/sync-data?${queryString.stringify({ deviceId, hospitalId: location?.hospital, })}`,
                );
                const updatePolicyPromise = getUpdatePolicy().catch(() => null);

                const [res, updatePolicyRes] = await Promise.all([
                    syncPromise,
                    updatePolicyPromise,
                ]);

                const json = await res.json();
                const webeditorInfo = json?.webeditorInfo || {};
                const device = json?.device || {};
                const configKeys = json?.configKeys || [];
                const drugsLibrary = json?.drugsLibrary || [];
                const scripts = json?.scripts || [];
                const screens = json?.screens || [];
                const diagnoses = json?.diagnoses || [];
                const problems = json?.problems || [];
                const aliases = json?.aliases || []

                await Promise.all(['scripts', 'screens', 'diagnoses', 'problems', 'config_keys', 'drugs_library'].map(table => dbTransaction(
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

                drugsLibrary.map((s: any) => {
                    const columns = ['id', 'item_id', 'data', 'createdAt', 'updatedAt'].join(',');
                    const values = ['?', '?', '?', '?', '?'].join(',');
                    return dbTransaction(`insert or replace into drugs_library (${columns}) values (${values});`, [
                        s.id,
                        s.itemId,
                        JSON.stringify(s || {}),
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
                    aliases?.data?.map((s: any) => {
                    const columns = ['scriptid', 'old_script', 'alias', 'name'].join(',');
                    const values = ['?', '?', '?', '?'].join(',');
                    promises.push(dbTransaction(`insert or replace into nt_aliases (${columns}) values (${values});`, [
                        s.script,
                        s.oldScript,
                        s.alias,
                        s.name
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

                problems.map((s: any) => {
                    const columns = ['id', 'problem_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
                    const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
                    promises.push(dbTransaction(`insert or replace into problems (${columns}) values (${values});`, [
                        s.id,
                        s.problem_id,
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
                    uid_prefix: _application?.uid_prefix || device?.device_hash||'FB8E',
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

                if (updatePolicyRes?.data) {
                    await AsyncStorage.setItem(
                        ASYNC_STORAGE_KEYS.UPDATE_POLICY,
                        JSON.stringify(updatePolicyRes.data || {}),
                    );
                    await dbTransaction(
                        'insert or replace into app_update_policy (id, data, updatedAt) values (?, ?, ?);',
                        [1, JSON.stringify(updatePolicyRes.data || {}), new Date().toISOString()],
                    );
                    await recordUpdateEvent('apk_policy_seen', {
                        apkReleaseId: updatePolicyRes.data.currentApkRelease?.apkReleaseId || null,
                        policyVersion: updatePolicyRes.data.policyVersion,
                        deliveryMode: updatePolicyRes.data.apk?.deliveryMode || 'in_app',
                        status: 'seen',
                    }).catch(() => null);
                } else if (updatePolicyRes?.status === 404) {
                    // Only clear the cached policy when the server definitively says
                    // there is none for this device. Transient errors / skipped calls
                    // keep the last known policy so the tablet keeps working offline.
                    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.UPDATE_POLICY);
                    await dbTransaction('delete from app_update_policy where id=1;');
                }

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
                if (!app?.webeditor_info?.version) throw new Error(e);
                AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SYNC_ERROR, 'Failed to connect to sync');
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

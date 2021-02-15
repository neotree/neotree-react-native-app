import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

import createTablesIfNotExist from './_createTablesIfNotExist';
import getAuthenticatedUser from './_getAuthenticatedUser';
import * as webeditorApi from '../webeditor';

import { insertScreens, deleteScreens } from './screens';
import { insertDiagnoses, deleteDiagnoses } from './diagnoses';
import { insertScripts, deleteScripts } from './scripts';
import { insertConfigKeys, deleteConfigKeys } from './config_keys';
import { getDataStatus, updateDataStatus } from './data_status';
import { getAppInfo } from './app_info';

export default function sync() {
  return new Promise((resolve, reject) => {
    (async () => {
      let authenticatedUser = null;
      let dataStatus = null;
      let neworkState = null;
      let deviceId = null;
      let deviceRegistration = null;
      let appInfoLocal = null;
      let appInfoRemote = null;

      const done = async (e, data) => {
        await updateDataStatus({
          ...dataStatus,
          updatedAt: new Date().toISOString(),
        });
        if (e) return reject(e);
        resolve({
          ...data,
          authenticatedUser,
          dataStatus,
          deviceId,
          deviceRegistration,
        });
      };

      // get network status
      try {
        neworkState = await NetInfo.fetch();
      } catch (e) {
        return reject(new Error(`Error loading network info: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // create tables if they don't exist
      try {
        await createTablesIfNotExist();
      } catch (e) {
        return reject(new Error(`Error creating tables: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // get authenticated user
      try {
        authenticatedUser = await getAuthenticatedUser();
      } catch (e) {
        return reject(new Error(`Error loading authenticated user: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // get device id
      try {
        deviceId = await new Promise((resolve, reject) => {
          if (Platform.OS === 'android') return resolve(Application.androidId);
          Application.getIosIdForVendorAsync()
            .then(uid => resolve(uid))
            .catch(reject);
        });
      } catch (e) {
        return reject(new Error(`Error loading device id: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // Don't proceed if there's no internet
      if (!neworkState.isInternetReachable) return done();

      // Don't proceed if not authenticated
      if (!authenticatedUser) return done();

      try {
        appInfoLocal = await getAppInfo();
      } catch (e) { /* DO NOTHING */ }

      // get device registration
      try {
        const { device, appInfo } = await webeditorApi.getDeviceRegistration({ deviceId });
        deviceRegistration = device;
        appInfoRemote = appInfo;
      } catch (e) { console.log('errors', e); /* Do nothing */ }

      console.log(appInfoLocal, appInfoRemote);

      // get data status
      try {
        dataStatus = await getDataStatus(deviceRegistration);
      } catch (e) {
        return reject(new Error(`Error loading data status: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // if data registration was unsuccessfull
      if (!dataStatus.uid_prefix) return reject(new Error('Failed to register and create device hash'));

      /********************************************************************************************************************************** 
       ****************************************************** DOWNLOADING DATA **********************************************************
       **********************************************************************************************************************************/
      try { 
        const {
          scripts,
          screens,
          configKeys,
          diagnoses,
          deletedScripts,
          deletedScreens,
          deletedConfigKeys,
          deletedDiagnoses,
        } = await webeditorApi.syncData({
          deviceId: dataStatus.device_id,
          scriptsCount: dataStatus.total_sessions_recorded,
          lastSyncDate: dataStatus.last_sync_date,
        });

        // save updated/new scripts
        if (scripts.length) { 
          try { await insertScripts(scripts); } catch (e) { /* Do nothing */ }
        }

        // save updated/new screens
        if (screens.length) { 
          try { await insertScreens(screens); } catch (e) { /* Do nothing */ }
        }

        // save updated/new diagnoses
        if (diagnoses.length) { 
          try { await insertDiagnoses(diagnoses); } catch (e) { /* Do nothing */ }
        }

        // save updated/new config keys
        if (configKeys.length) {
          try { await insertConfigKeys(configKeys); } catch (e) { /* Do nothing */ }
        }

        try {
          if (deletedScripts.length) {
            await deleteScripts(deletedScripts.map(s => ({ script_id: s.script_id })));
            await deleteScreens(deletedScripts.map(s => ({ script_id: s.script_id })));
            await deleteDiagnoses(deletedScripts.map(s => ({ script_id: s.script_id })));
          }
          if (deletedScreens.length) await deleteScreens(deletedScreens.map(s => ({ screen_id: s.screen_id })));
          if (deletedDiagnoses.length) await deleteDiagnoses(deletedDiagnoses.map(s => ({ diagnosis_id: s.diagnosis_id })));
          if (deletedConfigKeys.length) await deleteConfigKeys(deletedConfigKeys.map(s => ({ config_key_id: s.config_key_id })));
        } catch (e) { /* Do nothing */ }
      } catch (e) { return reject(e); }

      dataStatus.data_initialised = true;
      dataStatus.last_sync_date = new Date().toISOString();
      done();
    })();
  });
}

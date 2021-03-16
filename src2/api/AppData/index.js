import { Platform } from 'react-native';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import * as Application from 'expo-application';
import { dbTransaction } from '../database/db';
import createTablesIfNotExist from '../database/_createTablesIfNotExist';
import * as webeditorApi from '../webeditor';
import getAuthenticatedUser from '../database/_getAuthenticatedUser';
import { deleteScripts, insertScripts } from '../database/scripts';
import { deleteScreens, insertScreens } from '../database/screens';
import { deleteDiagnoses, insertDiagnoses } from '../database/diagnoses';
import { deleteConfigKeys, insertConfigKeys } from '../database/config_keys';
import { updateDeviceRegistration } from '../webeditor';

const APP_VERSION = Constants.manifest.version;

export default class AppData {
  getApplication = () => new Promise((resolve, reject) => {
    (async () => {
      try {
        let application = await dbTransaction('select * from application where id=1;');
        application = application[0];
        if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');
        resolve(application);
      } catch (e) { reject(e); }
    })();
  });

  getLocation = () => new Promise((resolve, reject) => {
    (async () => {
      try {
        let location = await dbTransaction('select * from location where id=1;');
        location = location[0];
        resolve(location);
      } catch (e) { reject(e); }
    })();
  });

  initlialise = () => new Promise((resolve, reject) => {
    (async () => {
      let application = null;
      let deviceId = null;
      let webEditor = null;
      let networkState = null;
      let authenticatedUser = null;
      let location = null;

      try {
        await createTablesIfNotExist();

        networkState = await NetInfo.fetch();

        authenticatedUser = await getAuthenticatedUser();

        location = await this.getLocation();

        if (!location) return resolve({ authenticatedUser, dataInitialised: false, });

        deviceId = await new Promise((resolve, reject) => {
          if (Platform.OS === 'android') return resolve(Application.androidId);
          Application.getIosIdForVendorAsync()
            .then(uid => resolve(uid))
            .catch(reject);
        });

        if (networkState.isInternetReachable) {
          webEditor = await webeditorApi.getDeviceRegistration({ deviceId });
        }

        application = await this.getApplication();

        if (!application) {
          if (!webEditor) throw new Error("Failed to initalise app data, make sure you're connected to the internet");

          const _application = {
            id: 1,
            mode: 'production',
            last_sync_date: null,
            version: APP_VERSION,
            uid_prefix: webEditor.device.device_hash,
            total_sessions_recorded: webEditor.device.details.scripts_count,
            device_id: webEditor.device.device_id,
            webeditor_info: JSON.stringify(webEditor.info),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await dbTransaction(
            `insert or replace into application (${Object.keys(_application).join(',')}) values (${Object.keys(_application).map(() => '?').join(',')});`,
            Object.values(_application)
          );

          application = await this.getApplication();
        }
      } catch (e) { return reject(e); }

      resolve({ application, authenticatedUser, location, dataInitialised: true, });
    })();
  });

  sync = (opts = {}) => new Promise((resolve, reject) => {
    const { force: forceSync, mode } = opts;

    (async () => {
      let application = null;
      let networkState = null;
      let authenticatedUser = null;
      let webEditor = null;
      let location = null;

      try {
        networkState = await NetInfo.fetch();

        authenticatedUser = await getAuthenticatedUser();

        location = await this.getLocation();

        if (!location) return resolve({ authenticatedUser, dataInitialised: false, });

        application = await this.getApplication();
      } catch (e) { return reject(e); }
      
      if (networkState.isInternetReachable) {
        try {
          webEditor = await webeditorApi.getDeviceRegistration({ deviceId: application.device_id });

          let shouldSync = forceSync || (authenticatedUser &&
            (application.mode === 'development' ? true : webEditor.info.version !== application.webeditor_info.version)
          );

          const lastSyncDate = (((mode || application.mode) === 'development') ||
            (webEditor.info.version !== application.webeditor_info.version)) ? application.last_sync_date : null;

          if (mode && (mode !== application.mode)) {
            shouldSync = true;
            if (mode === 'production') {
              await Promise.all(['scripts', 'screens', 'diagnoses', 'config_keys'].map(table => dbTransaction(
                `delete from ${table} where 1;`
              )));
            }
          }

          if (webEditor.device.details.scripts_count !== application.total_sessions_recorded) {
            const scripts_count = Math.max(...[application.total_sessions_recorded, webEditor.device.details.scripts_count]);
            const { device } = await updateDeviceRegistration({ deviceId: application.device_id, details: { scripts_count } });
            webEditor.device = device;
            application.total_sessions_recorded = scripts_count;
          }

          if (shouldSync) {
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
                deviceId: application.device_id,
                lastSyncDate,
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

            const _application = {
              ...application,
              mode: mode || application.mode,
              last_sync_date: new Date().toISOString(),
              webeditor_info: JSON.stringify(webEditor.info),
            };

            await dbTransaction(
              `insert or replace into application (${Object.keys(_application).join(',')}) values (${Object.keys(_application).map(() => '?').join(',')});`,
              Object.values(_application)
            );
            application = await this.getApplication();
          }
        } catch (e) { return reject(e); }
      }

      resolve({ application, authenticatedUser });
    })();
  });
}

import { Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { dbTransaction } from './database/db';
import * as webeditorApi from './webeditor';

const APP_VERSION = Constants.manifest.version;

const _getApplication = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const getApplicationRslt = await dbTransaction('select * from application where id=1;');
      const application = getApplicationRslt[0];
      if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');
      resolve(application);
    } catch (e) { reject(e); }
  })();
});

export const saveApplication = (params = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      let application = {
        ...params,
        id: 1,
        version: APP_VERSION,
        updatedAt: new Date().toISOString(),
      };
      await dbTransaction(
        `insert or replace into application (${Object.keys(application).join(',')}) values (${Object.keys(application).map(() => '?').join(',')});`,
        Object.values(application)
      );
      application = await _getApplication();
      resolve(application);
    } catch (e) { reject(e); }
  })();
});

export const getApplication = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      let application = await _getApplication();
      if (!application) {
        const deviceId = await new Promise((resolve, reject) => {
          if (Platform.OS === 'android') return resolve(Application.androidId);
          Application.getIosIdForVendorAsync()
            .then(uid => resolve(uid))
            .catch(reject);
        });

        const webEditor = await webeditorApi.getDeviceRegistration({ deviceId });

        await saveApplication({
          mode: 'production',
          last_sync_date: null,
          uid_prefix: webEditor.device.device_hash,
          total_sessions_recorded: webEditor.device.details.scripts_count,
          device_id: webEditor.device.device_id,
          webeditor_info: JSON.stringify(webEditor.info),
          createdAt: new Date().toISOString(),
        });

        application = await _getApplication();
      }
      resolve(application);
    } catch (e) { reject(e); }
  })();
});

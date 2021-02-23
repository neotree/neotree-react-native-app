import { Platform } from 'react-native';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import * as Application from 'expo-application';
import { dbTransaction } from '../database/db';
import createTablesIfNotExist from '../database/_createTablesIfNotExist';
import * as webeditorApi from '../webeditor';
import getAuthenticatedUser from '../database/_getAuthenticatedUser';

const APP_VERSION = Constants.manifest.version;

export default class AppData {
  constructor() {
    this.current_process = null;
    this.onprocess = null;
  }

  changeProcess = process => {
    this.current_process = process;
    if (this.onprocess) this.onprocess(process);
  };

  initlialise = () => new Promise((resolve, reject) => {
    (async () => {
      let application = null;
      let deviceId = null;
      let webEditor = null;
      let neworkState = null;
      let authenticatedUser = null;

      try {
        neworkState = await NetInfo.fetch();

        deviceId = await new Promise((resolve, reject) => {
          if (Platform.OS === 'android') return resolve(Application.androidId);
          Application.getIosIdForVendorAsync()
            .then(uid => resolve(uid))
            .catch(reject);
        });

        if (neworkState.isInternetReachable) {
          this.changeProcess('load_webeditor_info');
          webEditor = await webeditorApi.getDeviceRegistration({ deviceId });
        }

        this.changeProcess('initialise_tables');
        await createTablesIfNotExist();

        this.changeProcess('load_authenticated_user');
        authenticatedUser = await getAuthenticatedUser();

        this.changeProcess('load_application_info');
        const rslts = await dbTransaction('select * from application where id=1;');
        application = rslts[0];

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

          const rslts = await dbTransaction('select * from application where 1;');
          application = rslts[0];
        }

        application.webeditor_info = JSON.parse(application.webeditor_info || '{}');
      } catch (e) { return reject(e); }

      resolve({ application, authenticatedUser, });
    })();
  });
}

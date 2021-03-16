import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as webeditorApi from './webeditor';
import { getApplication } from './_application';
import NetInfo from '@react-native-community/netinfo';

export * from './database';

export * from './_auth';

export * from './_location';

export * from './webeditor';

export default function sync() {
  return new Promise((resolve, reject) => {
    (async () => {
      let deviceId = null;
      let webEditor = null;
      let application = null;
      let networkState = null;

      try {
        networkState = await NetInfo.fetch();

        deviceId = await new Promise((resolve, reject) => {
          if (Platform.OS === 'android') return resolve(Application.androidId);
          Application.getIosIdForVendorAsync()
            .then(uid => resolve(uid))
            .catch(reject);
        });

        if (networkState.isInternetReachable) {
          webEditor = await webeditorApi.getDeviceRegistration({ deviceId });
        }
      } catch (e) { reject(e); }

      resolve({ application });
    })();
  });
}

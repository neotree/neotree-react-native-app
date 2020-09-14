import { Platform } from 'react-native';
import getRandomString from '@/utils/getRandomString';
import * as Application from 'expo-application';
import db from '../db';

const genUIDPrefix = () => new Promise((resolve, reject) => {
  if (Platform.OS === 'android') return resolve(Application.androidId.substr(0,4).toUpperCase());
  Application.getIosIdForVendorAsync()
    .then(uid => resolve(uid.substr(0,4).toUpperCase()))
    .catch(reject);
});

const _getDataStatus = () => new Promise((resolve, reject) => {
  db.transaction(
    tx => {
      tx.executeSql(
        'select * from data_status limit 1;',
        null,
        (tx, rslts) => {
          const dataStatus = rslts.rows._array[0];
          resolve(dataStatus);
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: _getDataStatus', e);
            reject(e);
          }
        }
      );
    }
  );
});

const createDataStatus = (params = {}) => new Promise((resolve, reject) => {
  require('@/utils/logger')('createDataStatus');

  genUIDPrefix()
    .then(uid_prefix => {
      const unique_key = `${getRandomString()}${getRandomString()}${getRandomString()}${getRandomString()}`;

      const status = {
        id: 1,
        uid_prefix,
        unique_key,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...params
      };

      const columns = Object.keys(status)
        .filter(c => c)
        .join(',');

      const values = Object.keys(status).map(() => '?')
        .filter(c => c)
        .join(',');

      db.transaction(
        tx => {
          tx.executeSql(
            `insert or replace into data_status (${columns}) values (${values});`,
            Object.values(status),
            (tx, saveDataStatus) => {
              resolve(saveDataStatus);
            },
            (tx, e) => {
              if (e) {
                require('@/utils/logger')('ERROR: createDataStatus', e);
                reject(e);
              }
            }
          );
        }
      );
    })
    .catch(e => {
      require('@/utils/logger')('ERROR: genUIDPrefix', e);
      reject(e);
    });
});

const getDataStatus = () => new Promise((resolve, reject) => {
  _getDataStatus()
    .then(ds => {
      if (ds) return resolve(ds);
      createDataStatus()          
        .then(() => _getDataStatus().catch(reject).then(resolve))
        .catch(reject);
    })
    .catch(reject);
});

export default () => getDataStatus();

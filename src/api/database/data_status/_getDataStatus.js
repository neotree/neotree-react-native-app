import getRandomString from '@/utils/getRandomString';
import NetInfo from '@react-native-community/netinfo';
import getDeviceInfo from '@/utils/getDeviceInfo';
import db from '../db';
import makeApiCall from '../../webeditor/makeApiCall';
import updateDataStatus from './_updateDataStatus';

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
  const unique_key = `${getRandomString()}${getRandomString()}${getRandomString()}${getRandomString()}`;

  const status = {
    id: 1,
    unique_key,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
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
          NetInfo.fetch()
            .catch(() => resolve(saveDataStatus))
            .then(network => {
              if (!network.isInternetReachable) return resolve(saveDataStatus);

              makeApiCall('/register-device', {
                method: 'POST',
                payload: { unique_key, details: JSON.stringify(getDeviceInfo()) }
              })
                .catch(() => resolve(saveDataStatus))
                .then(saveDevice => {
                  const device = saveDevice && saveDevice.device;
                  if (device) {
                    return updateDataStatus({ device_id: device ? device.id : null })
                      .catch(() => resolve(saveDataStatus))
                      .then(() => resolve(saveDataStatus));
                  }
                  resolve(saveDataStatus);
                });
            });
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
});

const getDataStatus = () => new Promise((resolve, reject) => {
  _getDataStatus()
    .catch(reject)
    .then(dataStatus => {
      const registerIfNotFound = () => {
        createDataStatus()
          .catch(reject)
          .then(() => _getDataStatus().catch(reject).then(resolve));
      };

      if (dataStatus) {
        NetInfo.fetch()
          .catch(() => resolve(dataStatus))
          .then(network => {
            if (!network.isInternetReachable) return resolve(dataStatus);

            makeApiCall('/get-device', { payload: { unique_key: dataStatus.unique_key } })
              .catch(() => resolve(dataStatus))
              .then(device => {
                if (device) return resolve(dataStatus);
                registerIfNotFound(dataStatus);
              });
          });

        return;
      }

      registerIfNotFound();
    });
});

export default () => getDataStatus();

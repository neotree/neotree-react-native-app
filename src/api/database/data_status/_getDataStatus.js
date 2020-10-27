import db from '../db';

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

  const status = {
    id: 1,
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
});

export default function getDataStatus(deviceRegistration) {
  return new Promise((resolve, reject) => {
    (async () => {
      let ds = null;
      try { ds = await _getDataStatus(); } catch (e) { return reject(e); }

      if (ds) return resolve(ds);

      try {
        await createDataStatus(!deviceRegistration ? null : {
          uid_prefix: deviceRegistration.device_hash,
          total_sessions_recorded: deviceRegistration.details.scripts_count,
          device_id: deviceRegistration.device_id,
        });
      } catch (e) { return reject(e); }

      try { ds = await _getDataStatus(); } catch (e) { return reject(e); }

      resolve(ds);
    })();
  });
}

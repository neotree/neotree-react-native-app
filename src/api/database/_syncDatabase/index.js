import NetInfo from '@react-native-community/netinfo';

import { insertScreens, deleteScreens } from '../screens';
import { insertDiagnoses, deleteDiagnoses } from '../diagnoses';
import { insertScripts, deleteScripts } from '../scripts';
import { insertConfigKeys, deleteConfigKeys } from '../config_keys';

import { getScripts } from '../../webeditor/scripts';
import { getConfigKeys } from '../../webeditor/config_keys';
import { getScreens } from '../../webeditor/screens';
import { getDiagnoses } from '../../webeditor/diagnoses';
import { syncData as syncRemoteData } from '../../webeditor/syncData';
import { getDataStatus, updateDataStatus } from '../data_status';
import { getAuthenticatedUser } from '../../auth';

export default (data = {}) => new Promise((resolve, reject) => {
  Promise.all([
    NetInfo.fetch(), // check internet connection

    getDataStatus(),

    getAuthenticatedUser(),
  ])
    .catch(e => {
      require('@/utils/logger')('ERROR: syncDatabase - NetInfo.fetch(), getDataStatus(), getAuthenticatedUser(data)', e);
      reject(e);
    })
    .then(([network, dataStatus, authenticated]) => {
      const authenticatedUser = authenticated ? authenticated.user : null;

      const canSync = dataStatus && network.isInternetReachable && authenticatedUser;

      const _updateDataStatus = () => updateDataStatus({
        data_initialised: true,
        last_sync_date: new Date().toString(),
        updatedAt: new Date().toString(),
      });

      const done = (err, rslts, cb) => {
        if (err) return reject(err);
        if (!err && cb) cb();
        resolve({
          ...rslts,
          authenticatedUser,
          dataStatus: { ...dataStatus, data_initialised: true },
        });
      };

      if (!canSync) return done();

      require('@/utils/logger')('syncDatabase', `${data ? JSON.stringify(data) : ''}`);

      if (!dataStatus.data_initialised) {
        return Promise.all([
          getScripts(),
          getScreens(),
          getConfigKeys(),
          getDiagnoses(),
        ])
          .catch(e => {
            require('@/utils/logger')('ERROR: syncDatabase - if (!dataStatus.data_initialised), getRemoteDataActivityInfo()', e);
            done(e);
          })
          .then(([{ scripts }, { screens }, { config_keys }, { diagnoses }]) => {
            Promise.all([
              insertConfigKeys(config_keys),
              insertScripts(scripts),
              insertScreens(screens),
              insertDiagnoses(diagnoses)
            ])
              .catch(e => {
                require('@/utils/logger')('ERROR: syncDatabase - updateDataStatus, insertConfigKeys, insertScripts, insertScreens, insertDiagnoses', e);
                done(e);
              })
              .then((rslts) => {
                const [insertConfigKeysRslts, insertScriptsRslts, insertScreensRslts, insertDiagnosesRslts] = rslts;
                done(null, {
                  insertConfigKeysRslts,
                  insertScriptsRslts,
                  insertScreensRslts,
                  insertDiagnosesRslts,
                }, _updateDataStatus);
              });
          });
      }

      if (data && data.event) {
        const eventName = data.event.name;

        const syncEvent = ({ eventName, collection, getter, setter }) => {
          getter({ id: data.event[collection].map(s => s.id) })
            .catch(e => {
              require('@/utils/logger')(`ERROR: syncDatabase - if (eventName === "${eventName}")`, e);
              done(e);
            })
            .then(res => {
              setter(res[collection])
                .catch(e => {
                  require('@/utils/logger')(`ERROR: syncDatabase - if (eventName === "${eventName}")`, e);
                  done(e);
                })
                .then(rslts => done(null, { rslts }, _updateDataStatus));
            });
        };

        if ((eventName === 'create_config_keys') || (eventName === 'update_config_keys')) {
          return syncEvent({
            eventName,
            collection: 'config_keys',
            getter: getConfigKeys,
            setter: insertConfigKeys,
          });
        }

        if ((eventName === 'create_scripts') || (eventName === 'update_scripts')) {
          return syncEvent({
            eventName,
            collection: 'scripts',
            getter: getScripts,
            setter: insertScripts,
          });
        }

        if ((eventName === 'create_screens') || (eventName === 'update_screens')) {
          return syncEvent({
            eventName,
            collection: 'screens',
            getter: getScreens,
            setter: insertScreens,
          });
        }

        if ((eventName === 'update_diagnoses') || (eventName === 'create_diagnoses')) {
          return syncEvent({
            eventName,
            collection: 'diagnoses',
            getter: getDiagnoses,
            setter: insertDiagnoses,
          });
        }

        if (eventName === 'delete_scripts') {
          const _scripts = data.event.scripts || [];
          if (_scripts.length) {
            return deleteScripts(_scripts.map(s => ({ id: s.id })))
              .catch(e => {
                require('@/utils/logger')('ERROR: syncDatabase - if (eventName === "delete_scripts")', e);
                done(e);
              })
              .then(rslts => done(null, { rslts }, _updateDataStatus));
          }
        }


        if (eventName === 'delete_screens') {
          const _screens = data.event.screens || [];
          if (_screens.length) {
            deleteScreens(_screens.map(s => ({ id: s.id })))
              .catch(e => {
                require('@/utils/logger')('ERROR: syncDatabase - if (eventName === "delete_screens")', e);
                done(e);
              })
              .then(rslts => done(null, { rslts }));
          }
        }

        if (eventName === 'delete_diagnoses') {
          const _diagnoses = data.event.diagnoses || [];
          if (_diagnoses.length) {
            deleteDiagnoses(_diagnoses.map(s => ({ id: s.id })))
              .catch(e => {
                require('@/utils/logger')('ERROR: syncDatabase - if (eventName === "delete_diagnoses")', e);
                done(e);
              })
              .then(rslts => done(null, { rslts }, _updateDataStatus));
          }
        }

        if (eventName === 'delete_config_keys') {
          const _diagnoses = data.event.diagnoses || [];
          if (_diagnoses.length) {
            deleteConfigKeys(_diagnoses.map(s => ({ id: s.id })))
              .catch(e => {
                require('@/utils/logger')('ERROR: syncDatabase - if (eventName === "delete_config_keys")', e);
                done(e);
              })
              .then(rslts => done(null, { rslts }, _updateDataStatus));
          }
        }

        return done();
      }

      if (!dataStatus.last_sync_date) return done();

      syncRemoteData({ lastSyncDate: dataStatus.last_sync_date })
        .catch(e => {
          require('@/utils/logger')('ERROR: syncDatabase - syncRemoteData', e);
          done(e);
        })
        .then(res => {
          const { scripts, screens, config_keys, diagnoses } = res;
          const merge = (dataset1 = [], dataset2 = []) => [...dataset1, ...dataset2]
            .reduce((acc, item) => {
              return acc.map(item => item.id).indexOf(item.id) >= 0 ?
                acc : [...acc, item];
            }, []);

          const scriptsToInsert = merge(scripts.lastUpdated, scripts.lastCreated);
          const screensToInsert = merge(screens.lastUpdated, screens.lastCreated);
          const diagnosesToInsert = merge(diagnoses.lastUpdated, diagnoses.lastCreated);
          const keysToInsert = merge(config_keys.lastUpdated, config_keys.lastCreated);

          Promise.all([
            !scriptsToInsert.length ? null : insertScripts(scriptsToInsert),
            !screensToInsert.length ? null : insertScreens(screensToInsert),
            !diagnosesToInsert.length ? null : insertDiagnoses(diagnosesToInsert),
            !keysToInsert.length ? null : insertConfigKeys(keysToInsert),
            !screens.lastDeleted.length ? null : deleteScreens(screens.lastDeleted.map(s => ({ id: s.id }))),
            !diagnoses.lastDeleted.length ? null : deleteDiagnoses(diagnoses.lastDeleted.map(s => ({ id: s.id }))),
            !scripts.lastDeleted.length ? null : deleteScripts(scripts.lastDeleted.map(s => ({ id: s.id }))),
            !config_keys.lastDeleted.length ? null : deleteConfigKeys(config_keys.lastDeleted.map(s => ({ id: s.id }))),
          ])
            .catch(e => {
              require('@/utils/logger')('ERROR: syncDatabase - syncRemoteData(Promise.all)', e);
              done(e);
            })
            .then(rslts => done(null, { rslts }, _updateDataStatus));
        });
    });
});

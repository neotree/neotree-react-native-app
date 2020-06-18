import NetInfo from '@react-native-community/netinfo';

import getLocalDataActivityInfo from '../_getLocalDataActivityInfo';
import getRemoteDataActivityInfo from '../_getRemoteDataActivityInfo';
import { insertScreens, deleteScreens } from '../screens';
import { insertDiagnoses, deleteDiagnoses } from '../diagnoses';
import { insertScripts, deleteScripts } from '../scripts';
import { insertConfigKeys, deleteConfigKeys } from '../config_keys';

import getAuthenticatedUser from './_getAuthenticatedUser';
import { getScripts } from '../../webeditor/scripts';
import { getConfigKeys } from '../../webeditor/config_keys';
import { getScreens } from '../../webeditor/screens';
import { getDiagnoses } from '../../webeditor/diagnoses';
import { getDataStatus, updateDataStatus } from '../data_status';

export default (data = {}) => new Promise((resolve, reject) => {
  require('@/utils/logger')('syncDatabase', `${data ? JSON.stringify(data) : ''}`);

  Promise.all([
    NetInfo.fetch(), // check internet connection

    getDataStatus(),

    getAuthenticatedUser(data),
  ])
    .catch(e => {
      require('@/utils/logger')('ERROR: syncDatabase - NetInfo.fetch(), getDataStatus(), getAuthenticatedUser(data)', e);
      reject(e);
    })
    .then(([network, dataStatus, authenticated]) => {
      const authenticatedUser = authenticated ? authenticated.user : null;

      const canSync = network.isInternetReachable && authenticatedUser;

      const done = (err, rslts) => {
        if (err) return reject(err);
        resolve({
          ...rslts,
          dataStatus,
          authenticatedUser,
        });
      };

      if (!canSync) return done(null);

      Promise.all([
        data.event ? null : getLocalDataActivityInfo(),
        data.event ? null : getRemoteDataActivityInfo({ lastSyncDate: dataStatus.last_sync_date }),
      ])
        .catch(e => {
          require('@/utils/logger')('ERROR: syncDatabase - getLocalDataActivityInfo(), getRemoteDataActivityInfo()', e);
          done(e);
        })
        .then(([localDataActivityInfo, remoteDataActivityInfo]) => {
          let _getScripts = null;
          let _getConfigKeys = null;
          let _getScreens = null;
          let _deleteLocalScreens = null;
          let _deleteLocalScripts = null;
          let _deleteLocalConfigKeys = null;
          let _getDiagnoses = null;
          let _deleteLocalDiagnoses = null;

          if (!dataStatus.data_initialised) {
            _getScripts = () => getScripts();
            _getScreens = () => getScreens();
            _getConfigKeys = () => getConfigKeys();
            _getDiagnoses = () => getDiagnoses();
          } else {
            if (remoteDataActivityInfo && remoteDataActivityInfo.config_keys) {
              const lastUpdatedRemote = remoteDataActivityInfo.config_keys.lastUpdateDate;
              const lastUpdatedLocal = localDataActivityInfo.config_keys.lastUpdateDate;
              if (lastUpdatedRemote !== lastUpdatedLocal) {
                _getConfigKeys = () => getConfigKeys(lastUpdatedLocal ?
                  { updatedAt: { $gte: lastUpdatedLocal } }
                  :
                  {});
              }
            }

            if (remoteDataActivityInfo && remoteDataActivityInfo.scripts) {
              const lastUpdatedRemote = remoteDataActivityInfo.scripts.lastUpdateDate;
              const lastUpdatedLocal = localDataActivityInfo.scripts.lastUpdateDate;
              if (lastUpdatedRemote !== lastUpdatedLocal) {
                _getScripts = () => getScripts(lastUpdatedLocal ?
                  { updatedAt: { $gte: lastUpdatedLocal } }
                  :
                  {});
              }
            }

            if (remoteDataActivityInfo && remoteDataActivityInfo.screens &&
              remoteDataActivityInfo.screens.count && !localDataActivityInfo.screens.count) {
              const lastUpdatedRemote = remoteDataActivityInfo.screenss.lastUpdateDate;
              const lastUpdatedLocal = localDataActivityInfo.screenss.lastUpdateDate;
              if (lastUpdatedRemote !== lastUpdatedLocal) {
                _getScreens = () => getScreens(lastUpdatedLocal ?
                  { updatedAt: { $gte: lastUpdatedLocal } }
                  :
                  {});
              }
            }

            if (remoteDataActivityInfo && remoteDataActivityInfo.scripts &&
              remoteDataActivityInfo.scripts.lastDeleted.length) {
              _deleteLocalScripts = () => deleteScripts(remoteDataActivityInfo.scripts.lastDeleted);
            }

            if (remoteDataActivityInfo && remoteDataActivityInfo.screens &&
              remoteDataActivityInfo.screens.lastDeleted.length) {
              _deleteLocalScreens = () => deleteScreens(remoteDataActivityInfo.screens.lastDeleted);
            }

            if (remoteDataActivityInfo && remoteDataActivityInfo.diagnoses &&
              remoteDataActivityInfo.diagnoses.lastDeleted.length) {
              _deleteLocalDiagnoses = () => deleteDiagnoses(remoteDataActivityInfo.diagnoses.lastDeleted);
            }

            if (remoteDataActivityInfo && remoteDataActivityInfo.config_keys &&
              remoteDataActivityInfo.config_keys.lastDeleted.length) {
              _deleteLocalConfigKeys = () => deleteConfigKeys(remoteDataActivityInfo.config_keys.lastDeleted);
            }
          }

          if (data && data.event) {
            const eventName = data.event.name;

            if (eventName === 'create_config_keys') {
              _getConfigKeys = () => getConfigKeys({
                payload: { id: data.event.config_keys.map(s => s.id) } });
            }
            if (eventName === 'update_config_keys') {
              _getConfigKeys = () => getConfigKeys({
                payload: { id: data.event.config_keys.map(s => s.id) }
              });
            }
            if (eventName === 'delete_config_keys') {
              const _config_keys = data.event.config_keys || [];
              if (_config_keys.length) {
                _deleteLocalConfigKeys = () => deleteConfigKeys(_config_keys.map(s => ({ id: s.id })));
              }
            }

            if (eventName === 'create_scripts') {
              _getScripts = () => getScripts({
                payload: { id: data.event.scripts.map(s => s.id) } });
            }
            if (eventName === 'update_scripts') {
              _getScripts = () => getScripts({
                payload: { id: data.event.scripts.map(s => s.id) }
              });
            }
            if (eventName === 'delete_scripts') {
              const _scripts = data.event.scripts || [];
              if (_scripts.length) {
                _deleteLocalScripts = () => deleteScripts(_scripts.map(s => ({ id: s.id })));
              }
            }

            if (eventName === 'create_screens') {
              _getScreens = () => getScreens({
                payload: { id: data.event.screens.map(s => s.id) }
              });
            }
            if (eventName === 'update_screens') {
              _getScreens = () => getScreens({
                payload: { id: data.event.screens.map(s => s.id) }
              });
            }
            if (eventName === 'delete_screens') {
              const _screens = data.event.screens || [];
              if (_screens.length) {
                _deleteLocalScreens = () => deleteScreens(_screens.map(s => ({ id: s.id })));
              }
            }

            if (eventName === 'create_diagnoses') {
              _getDiagnoses = () => getDiagnoses({
                payload: { id: data.event.diagnoses.map(s => s.id) }
              });
            }
            if (eventName === 'update_diagnoses') {
              _getDiagnoses = () => getDiagnoses({
                payload: { id: data.event.diagnoses.map(s => s.id) }
              });
            }
            if (eventName === 'delete_diagnoses') {
              const _diagnoses = data.event.diagnoses || [];
              if (_diagnoses.length) {
                _deleteLocalDiagnoses = () => deleteDiagnoses(_diagnoses.map(s => ({ id: s.id })));
              }
            }
          }

          Promise.all([
            _getConfigKeys ? _getConfigKeys() : null,
            _getScripts ? _getScripts() : null,
            _getScreens ? _getScreens() : null,
            _getDiagnoses ? _getDiagnoses() : null,
            _deleteLocalDiagnoses ? _deleteLocalDiagnoses() : null,
            _deleteLocalScripts ? _deleteLocalScripts() : null,
            _deleteLocalScreens ? _deleteLocalScreens() : null,
            _deleteLocalConfigKeys ? _deleteLocalConfigKeys() : null,
          ])
            .catch(e => {
              require('@/utils/logger')('ERROR: syncDatabase - _getConfigKeys, _getScripts, _getScreens, _getDiagnoses, _deleteLocalDiagnoses, _deleteLocalScripts, _deleteLocalScreens, _deleteLocalConfigKeys', e);
              done(e);
            })
            .then(([configKeysRslts, scriptsRslts, screensRslts, diagnosesRslts]) => {
              const config_keys = configKeysRslts ? configKeysRslts.config_keys : [];
              const scripts = scriptsRslts ? scriptsRslts.scripts : [];
              const screens = screensRslts ? screensRslts.screens : [];
              const diagnoses = diagnosesRslts ? diagnosesRslts.diagnoses : [];
              // insert data into the local database

              Promise.all([
                updateDataStatus({
                  data_initialised: true,
                  last_sync_date: new Date().toString(),
                  updatedAt: new Date().toString(),
                }),
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
                  const [, insertConfigKeys, insertScriptsRslts, insertScreensRslts, insertDiagnosesRslts] = rslts;
                  done(null, {
                    authenticatedUser,
                    insertConfigKeys,
                    insertScriptsRslts,
                    insertScreensRslts,
                    insertDiagnosesRslts,
                    dataStatus: { ...dataStatus, data_initialised: true },
                  });
                });
            });
        });
    });
});

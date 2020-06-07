import NetInfo from '@react-native-community/netinfo';

import getLocalDataActivityInfo from '../_getLocalDataActivityInfo';
import getRemoteDataActivityInfo from '../_getRemoteDataActivityInfo';
import { insertScreens, deleteScreens } from '../screens';
import { insertScripts } from '../scripts';

import getAuthenticatedUser from './_getAuthenticatedUser';
import { getScripts } from '../../webeditor/scripts';
import { getScreens } from '../../webeditor/screens';
import { getDataStatus, updateDataStatus } from '../data_status';

export default (data = {}) => new Promise((resolve, reject) => {
  require('@/utils/logger')('syncDatabase', `${data ? JSON.stringify(data) : ''}`);

  Promise.all([
    NetInfo.fetch(), // check internet connection

    getDataStatus(),

    getAuthenticatedUser(data),
  ])
    .catch(reject)
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
        data.event ? null : getRemoteDataActivityInfo(),
      ])
        .catch(done)
        .then(([localDataActivityInfo, remoteDataActivityInfo]) => {
          let _getScripts = null;
          let _getScreens = null;
          let _deleteLocalScreens = null;
          let _deleteLocalScripts = null;

          if (!dataStatus.data_initialised) {
            _getScripts = () => getScripts();
            _getScreens = () => getScreens();
          } else {
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
          }

          if (data && data.event) {
            const eventName = data.event.name;

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
              _deleteLocalScripts = () => deleteScreens({
                payload: { id: data.event.scripts.map(s => s.id) }
              });
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
              _deleteLocalScreens = () => deleteScreens({
                payload: { id: data.event.screens.map(s => s.id) }
              });
            }
          }

          Promise.all([
            _getScripts ? _getScripts() : null,
            _getScreens ? _getScreens() : null,
            _deleteLocalScripts ? _deleteLocalScripts() : null,
            _deleteLocalScreens ? _deleteLocalScreens() : null,
          ])
            .catch(done)
            .then(([scriptsRslts, screensRslts]) => {
              const scripts = scriptsRslts ? scriptsRslts.scripts : [];
              const screens = screensRslts ? screensRslts.screens : [];
              // insert data into the local database

              Promise.all([
                dataStatus.data_initialised ? null : updateDataStatus({ data_initialised: true }),
                insertScripts(scripts),
                insertScreens(screens),
              ])
                .catch(done)
                .then((rslts) => {
                  const [, insertScriptsRslts, insertScreensRslts] = rslts;
                  done(null, {
                    authenticatedUser,
                    insertScriptsRslts,
                    insertScreensRslts,
                    dataStatus: { ...dataStatus, data_initialised: true },
                  });
                });
            });
        });
    });
});

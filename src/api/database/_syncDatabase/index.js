import NetInfo from '@react-native-community/netinfo';

import createTablesIfNotExist from '../_createTablesIfNotExist';
import getLocalDataActivityInfo from '../_getLocalDataActivityInfo';
import getRemoteDataActivityInfo from '../_getRemoteDataActivityInfo';
import insertAuthenticatedUser from '../_insertAuthenticatedUser';
import insertScreens from '../_insertScreens';
import insertScripts from '../_insertScripts';
import deleteScreens from '../_deleteScreens';

import { getScripts } from '../../webeditor/scripts';
import { getScreens } from '../../webeditor/screens';
import { getAuthenticatedUser } from '../../auth';

export default (data = {}) => new Promise((resolve, reject) => {
  require('@/utils/logger')('syncDatabase', `${data ? JSON.stringify(data) : ''}`);

  Promise.all([
    NetInfo.fetch(), // check internet connection
    new Promise((resolve, reject) => { // initialise tables and get authenticated user
      createTablesIfNotExist()
        .catch(reject)
        .then(() => {
          if (data.event && (data.event.name === 'authenticated_user')) {
            insertAuthenticatedUser(data.event.user)
              .catch(reject)
              .then(() => getAuthenticatedUser().catch(reject).then(resolve));
          } else {
            getAuthenticatedUser().catch(reject).then(resolve);
          }
        });
    })
  ])
    .catch(reject)
    .then(([network, authenticated]) => {
      const authenticatedUser = authenticated ? authenticated.user : null;

      const canSync = network.isInternetReachable && (authenticatedUser || (data && data.forceSync));

      if (!canSync) return resolve({ authenticatedUser });

      const sync = promises => {
        Promise.all(promises)
          .catch(reject)
          .then(([scriptsRslts, screensRslts]) => {
            const scripts = scriptsRslts ? scriptsRslts.scripts : [];
            const screens = screensRslts ? screensRslts.screens : [];
            // insert data into the local database

            Promise.all([
              insertScripts(scripts),
              insertScreens(screens),
            ])
              .catch(reject)
              .then(([insertScriptsRslts, insertScreensRslts]) => {
                resolve({ authenticatedUser, insertScriptsRslts, insertScreensRslts });
              });
          });
      };

      if (data && data.event) {
        const eventName = data.event.name;

        let _getScripts = null;
        let _getScreens = null;
        let _deleteLocalScreens = null;
        let _deleteLocalScripts = null;

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

        sync([
          _getScripts ? _getScripts() : null,
          _getScreens ? _getScreens() : null,
          _deleteLocalScripts ? _deleteLocalScripts() : null,
          _deleteLocalScreens ? _deleteLocalScreens() : null,
        ]);
      } else {
        Promise.all([
          getLocalDataActivityInfo(),
          getRemoteDataActivityInfo(),
        ])
          .catch(reject)
          .then(([localDataActivityInfo, remoteDataActivityInfo]) => {
            let _getScripts = null;
            let _getScreens = null;
            const _deleteLocalScreens = null;
            const _deleteLocalScripts = null;

            if (remoteDataActivityInfo.scripts.count && !localDataActivityInfo.scripts.count) {
              _getScripts = () => getScripts();
            }

            if (remoteDataActivityInfo.screens.count && !localDataActivityInfo.screens.count) {
              _getScreens = () => getScreens();
            }

            sync([
              _getScripts ? _getScripts() : null,
              _getScreens ? _getScreens() : null,
              _deleteLocalScripts ? _deleteLocalScripts() : null,
              _deleteLocalScreens ? _deleteLocalScreens() : null,
            ]);
          });
      }
    });
});

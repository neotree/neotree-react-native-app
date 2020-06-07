import NetInfo from '@react-native-community/netinfo';

import initialiseDB from './_initialiseDB';
import getLocalDataActivityInfo from '../_getLocalDataActivityInfo';
import getRemoteDataActivityInfo from '../_getRemoteDataActivityInfo';
import { insertScreens, deleteScreens } from '../screens';
import { insertScripts } from '../scripts';

import { getScripts } from '../../webeditor/scripts';
import { getScreens } from '../../webeditor/screens';
import { insertLog } from '../logs';

export default (data = {}) => new Promise((resolve, reject) => {
  require('@/utils/logger')('syncDatabase', `${data ? JSON.stringify(data) : ''}`);

  Promise.all([
    NetInfo.fetch(), // check internet connection

    initialiseDB(data), // this will create tables if they don't exist & get or set authenticated user if there's one
  ])
    .catch(reject)
    .then(([network, dbData]) => {
      const { dbInitLog, authenticated } = dbData;

      const authenticatedUser = authenticated ? authenticated.user : null;

      const canSync = network.isInternetReachable && authenticatedUser;

      const done = (err, rslts) => {
        if (err) return reject(err);
        resolve({
          ...rslts,
          dbInitLog,
          authenticatedUser,
          dataInitialised: dbInitLog ? true : false
        });
      };

      if (!canSync) return done(null);

      Promise.all([
        getLocalDataActivityInfo(),
        getRemoteDataActivityInfo(),
      ])
        .catch(done)
        .then(([localDataActivityInfo, remoteDataActivityInfo]) => {
          let _getScripts = null;
          let _getScreens = null;
          let _deleteLocalScreens = null;
          let _deleteLocalScripts = null;

          if (remoteDataActivityInfo.scripts.count && !localDataActivityInfo.scripts.count) {
            _getScripts = () => getScripts();
          }

          if (remoteDataActivityInfo.screens.count && !localDataActivityInfo.screens.count) {
            _getScreens = () => getScreens();
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
                dbInitLog ? null : insertLog({ name: 'init_data' }),
                insertScripts(scripts),
                insertScreens(screens),
              ])
                .catch(done)
                .then(([, insertScriptsRslts, insertScreensRslts]) => {
                  done(null, {
                    authenticatedUser,
                    insertScriptsRslts,
                    insertScreensRslts
                  });
                });
            });
        });
    });
});

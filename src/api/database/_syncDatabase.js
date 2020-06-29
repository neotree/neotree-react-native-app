import getLocalDataActivityInfo from './_getLocalDataActivityInfo';
import getRemoteDataActivityInfo from './_getRemoteDataActivityInfo';
import insertScreens from './_insertScreens';
import insertScripts from './_insertScripts';

import { getScripts } from '../scripts';
import { getScreens } from '../screens';

export default () => new Promise((resolve, reject) => {
  // create tables if not exist
  Promise.all([
    getLocalDataActivityInfo(),
    getRemoteDataActivityInfo(),
  ])
    .catch(reject)
    .then(([localDataActivityInfo, remoteDataActivityInfo]) => {
      let _getScripts = null;
      let _getScreens = null;

      if (remoteDataActivityInfo.scripts.count && !localDataActivityInfo.scripts.count) {
        _getScripts = getScripts();
      }

      if (remoteDataActivityInfo.screens.count && !localDataActivityInfo.screens.count) {
        _getScreens = getScreens();
      }

      Promise.all([_getScripts, _getScreens])
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
              resolve({ insertScriptsRslts, insertScreensRslts });
            });
        });
    });
});

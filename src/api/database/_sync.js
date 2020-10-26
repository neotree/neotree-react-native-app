import NetInfo from '@react-native-community/netinfo';

import createTablesIfNotExist from './_createTablesIfNotExist';
import getAuthenticatedUser from './_getAuthenticatedUser';
import * as webeditorApi from '../webeditor';

import { insertScreens, deleteScreens } from './screens';
import { insertDiagnoses, deleteDiagnoses } from './diagnoses';
import { insertScripts, deleteScripts } from './scripts';
import { insertConfigKeys, deleteConfigKeys } from './config_keys';
import { getDataStatus, updateDataStatus } from './data_status';

export default function sync(opts = {}) {
  const { socketEvent, deviceRegistration } = opts;

  return new Promise((resolve, reject) => {
    (async () => {
      let authenticatedUser = null;
      let dataStatus = null;
      let neworkState = null;

      const done = async (e, data) => {
        await updateDataStatus({
          ...dataStatus,
          last_sync_date: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        if (e) return reject(e);
        resolve({ ...data, authenticatedUser, dataStatus, });
      };

      // get network status
      try { neworkState = await NetInfo.fetch(); } catch (e) { return reject(e); }

      // create tables if they don't exist
      try { await createTablesIfNotExist(); } catch (e) { return reject(e); }

      // get data status
      try { dataStatus = await getDataStatus(deviceRegistration); } catch (e) { return reject(e); }

      // get authenticated user
      try { 
        const { user } = await getAuthenticatedUser(); 
        authenticatedUser = user;
      } catch (e) { return reject(e); }

      // Don't proceed if there's no internet
      if (!neworkState.isInternetReachable) return done();

      // Don't proceed if not authenticated
      if (!authenticatedUser) return done();

      /********************************************************************************************************************************** 
       ****************************************************** DOWNLOADING DATA **********************************************************
       **********************************************************************************************************************************/

      /***********  if this is the first time downloading  ***********/
      if (!dataStatus.data_initialised) {
        // download scripts
        try {
          const { scripts } = await webeditorApi.getScripts();
          try { await insertScripts(scripts); } catch (e) { /* Do nothing */ }
        } catch (e) { /* Do nothing */ }

        // download screens
        try {
          const { screens } = await webeditorApi.getScreens();
          try { await insertScreens(screens); } catch (e) { /* Do nothing */ }
        } catch (e) { /* Do nothing */ }

        // download diagnoses
        try { 
          const { diagnoses } = await webeditorApi.getDiagnoses();
          try { await insertDiagnoses(diagnoses); } catch (e) { /* Do nothing */ }
        } catch (e) { /* Do nothing */ }

        // download config keys
        try { 
          const { config_keys } = await webeditorApi.getConfigKeys();
          try { await insertConfigKeys(config_keys); } catch (e) { /* Do nothing */ }
        } catch (e) { /* Do nothing */ }

        dataStatus.data_initialised = true;

        return done();
      }

      /***********  if syncing from a socket event **********/
      if (socketEvent) {
        if ((socketEvent.name === 'create_scripts') || (socketEvent.name === 'update_scripts')) {
          // download scripts
          try { 
            const { scripts } = await webeditorApi.getScripts({ script_id: socketEvent.scripts.map(s => s.scriptId) });
            try { await insertScripts(scripts); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if ((socketEvent.name === 'create_screens') || (socketEvent.name === 'update_screens')) {
          // download screens
          try { 
            const { screens } = await webeditorApi.getScreens({ screen_id: socketEvent.screens.map(s => s.screenId) });
            try { await insertScreens(screens); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if ((socketEvent.name === 'create_diagnoses') || (socketEvent.name === 'update_diagnoses')) {
          // download diagnoses
          try { 
            const { diagnoses } = await webeditorApi.getDiagnoses({ diagnosis_id: socketEvent.diagnoses.map(s => s.diagnosisId) });
            try { await insertDiagnoses(diagnoses); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if ((socketEvent.name === 'create_config_keys') || (socketEvent.name === 'update_config_keys')) {
          // download config keys
          try { 
            const { config_keys } = await webeditorApi.getConfigKeys({ config_key_id: socketEvent.config_keys.map(s => s.configKeyId) });
            try { await insertConfigKeys(config_keys); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.scripts && socketEvent.scripts.length && (socketEvent.name === 'delete_scripts')) {
          // download scripts
          try { await deleteScripts(socketEvent.scripts.map(s => ({ id: s.id }))); } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.screens && socketEvent.screens.length && (socketEvent.name === 'delete_screens')) {
          // download screens
          try { await deleteScreens(socketEvent.screens.map(s => ({ id: s.id }))); } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.diagnoses && socketEvent.diagnoses.length && (socketEvent.name === 'delete_diagnoses')) {
          // download diagnoses
          try { await deleteDiagnoses(socketEvent.diagnoses.map(s => ({ id: s.id }))); } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.config_keys && socketEvent.config_keys.length && (socketEvent.name === 'delete_config_keys')) {
          // download config keys
          try { await deleteConfigKeys(socketEvent.config_keys.map(s => ({ id: s.id }))); } catch (e) { /* Do nothing */ }
        }

        return done();
      }

      /*********** download data if something changed on the server after the last sync date ********/

      if (!dataStatus.last_sync_date) return done();

      try { 
        const { scripts, screens, config_keys, diagnoses } = await webeditorApi.syncData({
          deviceId: dataStatus.device_id,
          scriptsCount: dataStatus.total_sessions_recorded,
          lastSyncDate: dataStatus.last_sync_date,
        });

        const merge = (dataset1 = [], dataset2 = []) => [...dataset1, ...dataset2]
          .reduce((acc, item) => {
            return acc.map(item => item.id).indexOf(item.id) >= 0 ?
              acc : [...acc, item];
          }, []);

        const scriptsToInsert = merge(scripts.lastUpdated, scripts.lastCreated);
        const screensToInsert = merge(screens.lastUpdated, screens.lastCreated);
        const diagnosesToInsert = merge(diagnoses.lastUpdated, diagnoses.lastCreated);
        const keysToInsert = merge(config_keys.lastUpdated, config_keys.lastCreated);

        // save updated/new scripts
        if (scriptsToInsert.length) { 
          try { await insertScripts(scriptsToInsert); } catch (e) { /* Do nothing */ }
        }

        // save updated/new screens
        if (screensToInsert.length) { 
          try { await insertScreens(screensToInsert); } catch (e) { /* Do nothing */ }
        }

        // save updated/new diagnoses
        if (diagnosesToInsert.length) { 
          try { await insertDiagnoses(diagnosesToInsert); } catch (e) { /* Do nothing */ }
        }

        // save updated/new config keys
        if (keysToInsert.length) {  
          try { await insertConfigKeys(keysToInsert); } catch (e) { /* Do nothing */ }
        }
      } catch (e) { reject(e); }

      done();
    })();
  });
}

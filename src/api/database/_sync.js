import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

import createTablesIfNotExist from './_createTablesIfNotExist';
import getAuthenticatedUser from './_getAuthenticatedUser';
import * as webeditorApi from '../webeditor';

import { insertScreens, deleteScreens } from './screens';
import { insertDiagnoses, deleteDiagnoses } from './diagnoses';
import { insertScripts, deleteScripts } from './scripts';
import { insertConfigKeys, deleteConfigKeys } from './config_keys';
import { getDataStatus, updateDataStatus } from './data_status';

export default function sync(opts = {}) {
  const { socketEvent } = opts;
  return new Promise((resolve, reject) => {
    (async () => {
      let authenticatedUser = null;
      let dataStatus = null;
      let neworkState = null;
      let deviceId = null;
      let deviceRegistration = null;

      const done = async (e, data) => {
        await updateDataStatus({
          ...dataStatus,
          last_sync_date: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        if (e) return reject(e);
        resolve({
          ...data,
          authenticatedUser,
          dataStatus,
          deviceId,
          deviceRegistration,
        });
      };

      // get network status
      try {
        neworkState = await NetInfo.fetch();
      } catch (e) {
        return reject(new Error(`Error loading network info: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // create tables if they don't exist
      try {
        await createTablesIfNotExist();
      } catch (e) {
        return reject(new Error(`Error creating tables: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // get authenticated user
      try {
        authenticatedUser = await getAuthenticatedUser();
      } catch (e) {
        return reject(new Error(`Error loading authenticated user: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // get device id
      try {
        deviceId = await new Promise((resolve, reject) => {
          if (Platform.OS === 'android') return resolve(Application.androidId);
          Application.getIosIdForVendorAsync()
            .then(uid => resolve(uid))
            .catch(reject);
        });
      } catch (e) {
        return reject(new Error(`Error loading device id: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // Don't proceed if there's no internet
      if (!neworkState.isInternetReachable) return done();

      // Don't proceed if not authenticated
      if (!authenticatedUser) return done();

      // get device registration
      try {
        const { device } = await webeditorApi.getDeviceRegistration({ deviceId });
        deviceRegistration = device;
      } catch (e) { /* Do nothing */ }

      // get data status
      try {
        dataStatus = await getDataStatus(deviceRegistration);
      } catch (e) {
        return reject(new Error(`Error loading data status: ${e.message || e.msg || JSON.stringify(e)}`));
      }

      // if data registration was unsuccessfull
      if (!dataStatus.uid_prefix) return reject(new Error('Failed to register and create device hash'));

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
        if (['create_scripts', 'update_scripts'].includes(socketEvent.name)) {
          // download scripts
          try { 
            const { scripts } = await webeditorApi.getScripts({ script_id: JSON.stringify(socketEvent.scripts.map(s => s.scriptId)) });
            try { await insertScripts(scripts); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if (['create_screens', 'update_screens'].includes(socketEvent.name)) {
          // download screens
          try { 
            const { screens } = await webeditorApi.getScreens({ screen_id: JSON.stringify(socketEvent.screens.map(s => s.screenId)) });
            try { await insertScreens(screens); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if (['create_diagnoses', 'update_diagnoses'].includes(socketEvent.name)) {
          // download diagnoses
          try { 
            const { diagnoses } = await webeditorApi.getDiagnoses({ diagnosis_id: JSON.stringify(socketEvent.diagnoses.map(s => s.diagnosisId)) });
            try { await insertDiagnoses(diagnoses); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if (['create_config_keys', 'update_config_keys'].includes(socketEvent.name)) {
          // download config keys
          try { 
            const { config_keys } = await webeditorApi.getConfigKeys({ config_key_id: JSON.stringify(socketEvent.configKeys.map(s => s.configKeyId)) });
            try { await insertConfigKeys(config_keys); } catch (e) { /* Do nothing */ }
          } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.scripts && socketEvent.scripts.length && (socketEvent.name === 'delete_scripts')) {
          // download scripts
          try {
            await deleteScripts(socketEvent.scripts.map(s => ({ script_id: s.scriptId })));
            await deleteScreens(socketEvent.scripts.map(s => ({ script_id: s.scriptId })));
            await deleteDiagnoses(socketEvent.scripts.map(s => ({ script_id: s.scriptId })));
          } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.screens && socketEvent.screens.length && (socketEvent.name === 'delete_screens')) {
          // download screens
          try { await deleteScreens(socketEvent.screens.map(s => ({ id: s.screenId }))); } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.diagnoses && socketEvent.diagnoses.length && (socketEvent.name === 'delete_diagnoses')) {
          // download diagnoses
          try { await deleteDiagnoses(socketEvent.diagnoses.map(s => ({ id: s.diagnosisId }))); } catch (e) { /* Do nothing */ }
        }

        if (socketEvent.configKeys && socketEvent.configKeys.length && (socketEvent.name === 'delete_config_keys')) {
          // download config keys
          try { await deleteConfigKeys(socketEvent.configKeys.map(s => ({ id: s.congigKeyId }))); } catch (e) { /* Do nothing */ }
        }

        return done();
      }

      if (!dataStatus.last_sync_date) return done();

      /**********************************************************************************************************************************
       ********************************************* DOWNLOADING DATA ON SOCKET EVENT ***************************************************
       **********************************************************************************************************************************/

      try { 
        const { scripts, screens, config_keys, diagnoses } = await webeditorApi.syncData({
          deviceId: dataStatus.device_id,
          scriptsCount: dataStatus.total_sessions_recorded,
          lastSyncDate: dataStatus.last_sync_date,
        });

        const merge = (dataset1 = [], dataset2 = [], idName) => [...dataset1, ...dataset2]
          .reduce((acc, item) => {
            return acc.map(item => item[idName]).indexOf(item[idName]) >= 0 ?
              acc : [...acc, item];
          }, []);

        const scriptsToInsert = merge(scripts.lastUpdated, scripts.lastCreated, 'scriptId');
        const screensToInsert = merge(screens.lastUpdated, screens.lastCreated, 'screenId');
        const diagnosesToInsert = merge(diagnoses.lastUpdated, diagnoses.lastCreated, 'diagnosisId');
        const keysToInsert = merge(config_keys.lastUpdated, config_keys.lastCreated, 'congigKeyId');

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

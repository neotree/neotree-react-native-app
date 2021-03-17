import * as webeditorApi from './webeditor';
import { getApplication, saveApplication } from './_application';
import { dbTransaction } from './database/db';
import { updateDeviceRegistration } from './webeditor';
import { deleteScripts, insertScripts } from './database/scripts';
import { deleteScreens, insertScreens } from './database/screens';
import { deleteDiagnoses, insertDiagnoses } from './database/diagnoses';
import { deleteConfigKeys, insertConfigKeys } from './database/config_keys';

export default function sync(opts = {}) {
  const { force: forceSync, mode } = opts;

  return new Promise((resolve, reject) => {
    (async () => {
      let webEditor = null;
      let application = null;

      try {
        application = await getApplication();

        webEditor = await webeditorApi.getDeviceRegistration({ deviceId: application.device_id });

        let shouldSync = forceSync || !application.last_sync_date || (
          (application.mode === 'development' ? true : webEditor.info.version !== application.webeditor_info.version)
        );

        const lastSyncDate = (((mode || application.mode) === 'development') ||
          (webEditor.info.version !== application.webeditor_info.version)) ? application.last_sync_date : null;

        if (mode && (mode !== application.mode)) {
          shouldSync = true;
          if (mode === 'production') {
            await Promise.all(['scripts', 'screens', 'diagnoses', 'config_keys'].map(table => dbTransaction(
              `delete from ${table} where 1;`
            )));
          }
        }

        if (webEditor.device.details.scripts_count !== application.total_sessions_recorded) {
          const scripts_count = Math.max(...[application.total_sessions_recorded, webEditor.device.details.scripts_count]);
          const { device } = await updateDeviceRegistration({ deviceId: application.device_id, details: { scripts_count } });
          webEditor.device = device;
          application.total_sessions_recorded = scripts_count;
        }

        if (shouldSync) {
          try {
            const {
              scripts,
              screens,
              configKeys,
              diagnoses,
              deletedScripts,
              deletedScreens,
              deletedConfigKeys,
              deletedDiagnoses,
            } = await webeditorApi.syncData({
              deviceId: application.device_id,
              lastSyncDate,
            });

            // save updated/new scripts
            if (scripts.length) {
              try { await insertScripts(scripts); } catch (e) { /* Do nothing */ }
            }

            // save updated/new screens
            if (screens.length) {
              try { await insertScreens(screens); } catch (e) { /* Do nothing */ }
            }

            // save updated/new diagnoses
            if (diagnoses.length) {
              try { await insertDiagnoses(diagnoses); } catch (e) { /* Do nothing */ }
            }

            // save updated/new config keys
            if (configKeys.length) {
              try { await insertConfigKeys(configKeys); } catch (e) { /* Do nothing */ }
            }

            try {
              if (deletedScripts.length) {
                await deleteScripts(deletedScripts.map(s => ({ script_id: s.script_id })));
                await deleteScreens(deletedScripts.map(s => ({ script_id: s.script_id })));
                await deleteDiagnoses(deletedScripts.map(s => ({ script_id: s.script_id })));
              }
              if (deletedScreens.length) await deleteScreens(deletedScreens.map(s => ({ screen_id: s.screen_id })));
              if (deletedDiagnoses.length) await deleteDiagnoses(deletedDiagnoses.map(s => ({ diagnosis_id: s.diagnosis_id })));
              if (deletedConfigKeys.length) await deleteConfigKeys(deletedConfigKeys.map(s => ({ config_key_id: s.config_key_id })));
            } catch (e) { /* Do nothing */ }
          } catch (e) { return reject(e); }

          application = await saveApplication({
            ...application,
            mode: mode || application.mode,
            last_sync_date: new Date().toISOString(),
            webeditor_info: JSON.stringify(webEditor.info),
          });
        }
      } catch (e) { return reject(e); }

      resolve({ application });
    })();
  });
}

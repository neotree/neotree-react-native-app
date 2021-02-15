import db from '../db';
import saveAppInfo from './_saveAppInfo';

export default () => new Promise((resolve, reject) => {
  db.transaction(
    tx => {
      tx.executeSql(
        'select * from app_info limit 1;',
        null,
        (tx, rslts) => {
          (async () => {
            const appInfo = rslts.rows._array[0];
            if (!appInfo) {
              try {
                await Promise.all(
                  [
                    'delete from screens where 1;',
                    'delete from scripts where 1;',
                    'delete from diagnoses where 1;',
                    'delete from config_keys where 1;',
                    'delete from data_status where 1;',
                  ].map(q => new Promise((resolve, reject) => {
                    db.transaction(
                      tx => tx.executeSql(
                        q,
                        null,
                        (tx, rslts) => resolve(rslts),
                        (tx, e) => reject(e)
                      )
                    );
                  }))
                );
              } catch (e) { /* DO NOTHING */ }

              try { console.log('Saving app info...'); await saveAppInfo(); } catch (e) { /* DO NOTHING */ }
            }
            resolve(appInfo);
          })();
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getAppInfo', e);
            reject(e);
          }
        }
      );
    }
  );
});

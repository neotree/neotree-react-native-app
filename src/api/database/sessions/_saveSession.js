import db from '../db';
import { getDataStatus, updateDataStatus } from '../data_status';
import sync from '../_sync';

export default (data = {}) => new Promise((resolve, reject) => {
  (async () => {
    let dataStatus = null;
    try { dataStatus = await getDataStatus(); } catch (e) { /* Do nothing */}

    const done = (err, rslts) => {
      if (err) return reject(err);
      resolve(rslts);
    };
  
    const { data: { completed_at } } = data;
  
    const columns = [data.id ? 'id' : '', 'uid', 'script_id', 'data', 'completed', 'exported', 'createdAt', 'updatedAt']
      .filter(c => c)
      .join(',');
  
    const values = [data.id ? '?' : '', '?', '?', '?', '?', '?', '?', '?']
      .filter(c => c)
      .join(',');
  
    const params = [
      ...data.id ? [data.id] : [],
      data.uid,
      data.script_id,
      JSON.stringify(data.data || '{}'),
      data.completed || false,
      data.exported || false,
      data.createdAt || new Date().toISOString(),
      data.updatedAt || new Date().toISOString(),
    ];
  
    db.transaction(
      tx => {
        tx.executeSql(
          `insert or replace into sessions (${columns}) values (${values});`,
          params,
          (tx, rslts) => {
            if (data.uid && dataStatus && (dataStatus.uid_prefix === data.uid.substr(0, 4))) {
              updateDataStatus({ 
                ...dataStatus, 
                total_sessions_recorded: dataStatus.total_sessions_recorded + 1,
              }).then(() => sync()).catch(() => { /**/ });
            }
            done(null, rslts);
          },
          (tx, e) => {
            if (e) {
              require('@/utils/logger')('ERROR: saveSession', e);
              reject(e);
            }
          }
        );
      }
    );
  })();
});

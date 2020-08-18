import db from '../db';

export default () => new Promise((resolve, reject) => {
  db.transaction(
    tx => {
      tx.executeSql(
        'select * from sessions_stats;'.trim(),
        null,
        (tx, rslts) => {
          resolve({ stats: rslts.rows._array[0], });
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getStats', e);
            reject(e);
          }
        }
      );
    }
  );
});

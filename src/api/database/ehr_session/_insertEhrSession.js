import db from '../db';

export default (data = '') => new Promise((resolve, reject) => {

  if(data){
  db.transaction(
    tx => {
      tx.executeSql(
        'insert or replace into ehr_session (id,session_key, createdAt) values (?, ?, ?);',
        [1, data, new Date().toISOString()],
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: saveEhrSession', e);
            reject(e);
          }
        }
      );
    }
  );
  }
});
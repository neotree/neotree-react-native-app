import db from '../db';
import _getSessions from './_getSessions'

export default  (data = {}) => new Promise((resolve, reject) => {
  const done = (err, rslts) => {
    if (err) return reject(err);
    resolve(rslts);

  };

  const id = data.id;
  const params = [JSON.stringify(data.data || '{}')];
  console.log("@@@@@-ID--",id)
  db.transaction(
    tx => {
      tx.executeSql(
        `update sessions set data =? where id = ${id};`,
        params,
        (tx, rslts) => {
          console.log("@@@@@-QR--",rslts)
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
});

import db from './db';

export default () => new Promise((resolve, reject) => {
  const querys = [
    'select count(id) from scripts',
    'select createdAt from scripts order by createdAt desc limit 1;',
    'select updatedAt from scripts order by updatedAt desc limit 1;',

    'select count(id) from screens',
    'select createdAt from screens order by createdAt desc limit 1;',
    'select updatedAt from screens order by updatedAt desc limit 1;',
  ].map(q => new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(
        q,
        null,
        (tx, rslts) => rslts && resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: createTablesIfNotExists', e);
            reject(e);
          }  
        }
      )
    );
  }));

  Promise.all(querys)
    .then(rslts => {
      resolve({
        scripts: {
          count: rslts[0] ? rslts[0].rows._array[0]['count(id)'] : null,
          lastCreatedDate: rslts[1] && rslts[1].rows._array[0] ? rslts[1].rows._array[0].createdAt : null,
          lastUpdatedDate: rslts[2] && rslts[2].rows._array[0] ? rslts[2].rows._array[0].updatedAt : null,
        },
        screens: {
          count: rslts[3] ? rslts[3].rows._array[0]['count(id)'] : null,
          lastCreatedDate: rslts[4] && rslts[4].rows._array[0] ? rslts[4].rows._array[0].createdAt : null,
          lastUpdatedDate: rslts[5] && rslts[5].rows._array[0] ? rslts[5].rows._array[0].updatedAt : null,
        },
      });
    })
    .catch(reject);
});

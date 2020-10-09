import db from '../db';

export default (data = '') => new Promise((resolve, reject) => {

  if(data){
  const columns = [data.id ? 'id' : '', 'ehr_personId', 'neotree_id', 'source']
  .filter(c => c)
  .join(',');

  const values = [data.id ? '?' : '', '?', '?', '?']
  .filter(c => c)
  .join(',');

  const params = [
    ...data.id ? [data.id] : [],
    data.ehr_personId,
    data.neotree_id,
    data.source || 'neotree',
  ];
  db.transaction(
    tx => {
      tx.executeSql(
        `insert or replace into ehr_neotree (${columns}) values (${values})`,
        params,
        (tx, rslts) => resolve(rslts),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: saveEhrNeotree', e);
            reject(e);
          }
        }
      );
    }
  );
  }
});
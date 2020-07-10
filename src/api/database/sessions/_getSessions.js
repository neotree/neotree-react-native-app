import db from '../db';

export default (options = {}) => new Promise((resolve, reject) => {
  const { _order, ..._where } = options || {};

  let order = (_order || [['createdAt', 'DESC']]);
  order = (order.map ? order : [])
    .map(keyVal => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
    .filter(clause => clause)
    .join(',');

  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'select * from sessions';
  q = where ? `${q} where ${where}` : q;
  q = order ? `${q} order by ${order}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q};`.trim(),
        null,
        (tx, rslts) => {
          resolve({
            sessions: rslts.rows._array.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))
          });
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getSessions', e);
            reject(e);
          }
        }
      );
    }
  );
});

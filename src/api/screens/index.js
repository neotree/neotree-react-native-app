import db from '../database';

export const getScreen = (options = {}) => new Promise((resolve, reject) => {
  const { ..._where } = options.payload || {};

  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'select * from screens';
  q = where ? `${q} where ${where}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q} limit 1;`.trim(),
        null,
        (tx, rslts) => resolve({
          screen: rslts.rows._array.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]
        }),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: createTablesIfNotExists', e);
            reject(e);
          }
        }
      );
    }
  );
});

export const getScreens = (options = {}) => new Promise((resolve, reject) => {
  const { _order, ..._where } = options.payload || {};

  let order = (_order || [['position', 'ASC']]);
  order = (order.map ? order : [])
    .map(keyVal => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
    .filter(clause => clause)
    .join(',');

  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'select * from screens';
  q = where ? `${q} where ${where}` : q;
  q = order ? `${q} order by ${order}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q};`.trim(),
        null,
        (tx, rslts) => resolve({
          screens: rslts.rows._array.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))
        }),
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: createTablesIfNotExists', e);
            reject(e);
          }
        }
      );
    }
  );
});

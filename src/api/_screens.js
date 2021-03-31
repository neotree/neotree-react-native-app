import { dbTransaction } from './database/db';

export const getScreens = (options = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { _order, ..._where } = options || {};

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

      const rows = await dbTransaction(`${q};`.trim(), null);
      resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
    } catch (e) { reject(e); }
  })();
});

export const saveScreens = (data = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      data = data || [];
      if (!data.length) return resolve(null);

      const res = await Promise.all(data.map(s => {
        const columns = ['id', 'screen_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
        const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
        return dbTransaction(`insert or replace into screens (${columns}) values (${values});`, [
          s.id,
          s.screen_id,
          s.script_id,
          s.position,
          s.type,
          JSON.stringify(s.data || {}),
          s.createdAt,
          s.updatedAt
        ]);
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const deleteScreens = (params = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      params = params || [];
      if (!params.map) params = [params];

      const res = await Promise.all(params.map(_where => {
        const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
          .join(',');
        let q = 'delete from screens';
        q = where ? `${q} where ${where}` : q;

        return dbTransaction(`${q};`.trim());
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

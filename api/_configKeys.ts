import { dbTransaction } from './db';
import { QueryFilter, ConfigKeyRow, ConfigKey, ConfigKeyData } from './types';

export const getConfigKeys = (options: QueryFilter = {}) => new Promise<ConfigKey[]>((resolve, reject) => {
  (async () => {
    try {
      const { order: _order, ..._where } = options || {};

      const orderValue = (_order || [['position', 'ASC']]);
      const order = (orderValue.map ? orderValue : [])
        .map(keyVal => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
        .filter(clause => clause)
        .join(',');

      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');

      let q = 'select * from config_keys';
      q = where ? `${q} where ${where}` : q;
      q = order ? `${q} order by ${order}` : q;

      const rows = await dbTransaction<ConfigKeyRow>(`${q};`.trim(), null);
      resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') as ConfigKeyData } as ConfigKey)));
    } catch (e) { reject(e); }
  })();
});

export const saveConfigKeys = (data = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      data = data || [];
      if (!data.length) return resolve(null);

      const res = await Promise.all(data.map(s => {
        const columns = ['id', 'config_key_id', 'data', 'createdAt', 'updatedAt'].join(',');
        const values = ['?', '?', '?', '?', '?'].join(',');
        return dbTransaction<ConfigKeyRow>(`insert or replace into config_keys (${columns}) values (${values});`, [
          s.id,
          s.config_key_id,
          JSON.stringify(s.data || {}),
          s.createdAt,
          s.updatedAt
        ]);
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const deleteConfigKeys = (params = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      params = params || [];
      if (!params.map) params = [params];

      const res = await Promise.all(params.map(_where => {
        const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
          .join(',');
        let q = 'delete from config_keys';
        q = where ? `${q} where ${where}` : q;

        return dbTransaction<ConfigKeyRow>(`${q};`.trim());
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});
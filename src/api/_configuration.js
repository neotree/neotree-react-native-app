import { dbTransaction } from './database/db';
import { getConfigKeys } from './_configKeys';

export const saveConfiguration = (data = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const res = await dbTransaction(
        'insert or replace into configuration (id, data, createdAt, updatedAt) values (?, ?, ?, ?);',
        [1, JSON.stringify(data || {}), new Date().toISOString(), new Date().toISOString()]
      );
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const getConfiguration = (options = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { ..._where } = options || {};
      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');
      let q = 'select * from configuration';
      q = where ? `${q} where ${where}` : q;

      const configurationRslts = await dbTransaction(`${q} limit 1;`.trim());
      const configuration = {
        data: {},
        ...configurationRslts.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]
      };
      const configKeys = await getConfigKeys();
      resolve({
        ...configuration,
        data: configKeys.reduce((acc, { data: { configKey } }) => ({
          ...acc,
          [configKey]: acc[configKey] ? true : false,
        }), configuration.data)
      });
    } catch (e) { reject(e); }
  })();
});

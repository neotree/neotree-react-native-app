import db from '../db';
import getConfigKeys from '../config_keys/_getConfigKeys';

export default (options = {}) => new Promise((resolve, reject) => {
  const { ..._where } = options || {};

  const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
    .join(',');

  let q = 'select * from configuration';
  q = where ? `${q} where ${where}` : q;

  db.transaction(
    tx => {
      tx.executeSql(
        `${q} limit 1;`.trim(),
        null,
        (tx, rslts) => {
          const c = {
            data: {},
            ...rslts.rows._array.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]
          };
          getConfigKeys()
            .catch(() => resolve({ configuration: c }))
            .then(({ config_keys }) => {
              resolve({ 
                configuration: {
                  ...c,
                  data: config_keys.reduce((acc, { data: { configKey } }) => ({
                    ...acc,
                    [configKey]: acc[configKey] ? true : false,
                  }), c.data)
                }
              });
            });
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getConfiguration', e);
            reject(e);
          }
        }
      );
    }
  );
});

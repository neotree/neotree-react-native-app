import { dbTransaction } from './database/db';

export const getLocation = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const rows = await dbTransaction('select * from location limit 1;', null, 'main');
      resolve(rows[0]);
    } catch (e) { reject(e); }
  })();
});

export const saveLocation = (params = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const location = { ...params, id: 1 };

      await dbTransaction(
        `insert or replace into location (${Object.keys(location).join(',')}) values (${Object.keys(location).map(() => '?').join(',')});`,
        Object.values(location),
        'main'
      );

      const _location = await getLocation();
      resolve(_location);
    } catch (e) { reject(e); }
  })();
});
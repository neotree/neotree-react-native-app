import { dbTransaction } from './database/db';

export const getLocation = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const rows = await dbTransaction('select * from location limit 1;');
      resolve(rows[0]);
    } catch (e) { reject(e); }
  })();
});

export const saveLocation = (params = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const location = { id: 1, ...params };

      await dbTransaction(
        `insert or replace into location (${Object.keys(location).join(',')}) values (${Object.keys(location).map(() => '?').join(',')});`,
        Object.values(location)
      );

      const _location = await getLocation();
      resolve(_location);
    } catch (e) { reject(e); }
  })();
});

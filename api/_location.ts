import { dbTransaction } from './db';
import { Location } from './types';

export const getLocation = () => new Promise<Location | null>((resolve, reject) => {
  (async () => {
    try {
      const rows = await dbTransaction<Location>('select * from location limit 1;', null, 'main');
      resolve(rows[0]);
    } catch (e) { reject(e); }
  })();
});

export const saveLocation = (params = {}) => new Promise<Location | null>((resolve, reject) => {
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

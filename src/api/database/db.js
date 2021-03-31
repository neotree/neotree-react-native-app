import * as SQLite from 'expo-sqlite';
import config from '@/constants/config';

const { countries } = config;

const mainDB = SQLite.openDatabase('db.db');

export const dbs = countries.reduce((acc, c) => ({
  ...acc,
  [c]: SQLite.openDatabase(`db.${c}`),
}), { main: mainDB });

const _dbTransaction = (q, data = null, dbName = 'main') => new Promise((resolve, reject) => {
  const db = dbs[dbName];
  db.transaction(
    tx => {
      tx.executeSql(
        q,
        data,
        (tx, rslts) => resolve(rslts.rows._array),
        (tx, e) => reject(e)
      );
    },
  );
});

export const dbTransaction = (q, data = null, dbName) => new Promise((resolve, reject) => {
  (async () => {
    try {
      if (!dbName) {
        let location = await _dbTransaction('select * from location limit 1;', null, 'main');
        location = location[0];
        if (!location) throw new Error('Location not set');
        dbName = location.country;
      }
      const res = await _dbTransaction(q, data, dbName);
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

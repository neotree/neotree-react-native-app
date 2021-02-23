import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('db.db');

export const dbTransaction = (q, data = null) => new Promise((resolve, reject) => {
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

export default db;

import * as SQLite from 'expo-sqlite';
import { ENV } from '@/constants';
import { tables } from './tables';
import { Location } from '../types';

export * from './tables';

const countries = ENV.countries.map(c => c.country_code);

const mainDB = SQLite.openDatabase('db.db');

export const dbs = countries.reduce((acc, c) => ({
  ...acc,
  [c]: SQLite.openDatabase(`db.${c}`),
}), { main: mainDB });

function _dbTransaction<T = any>(
    query: string, 
    data: null | (string | number | Date | boolean)[] = null,
    dbName: string = 'main'
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const db = dbs[dbName];
        db.transaction(
            tx => {
            tx.executeSql(
                query,
                data,
                (tx, rslts) => resolve(rslts.rows._array),
                (tx, e) => reject(e)
            );
            },
        );
    });
}

export function dbTransaction<T = any>(
    query: string, 
    data: null | (string | number | Date | boolean)[] = null, 
    dbName?: string
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
            if (!dbName) {
                let rows = await _dbTransaction<Location>('select * from location limit 1;', null, 'main');
                const location = rows[0];
                if (!location) throw new Error('Location not set');
                dbName = location.country;
            }
            const res = await _dbTransaction(query, data, dbName);
            resolve(res);
            } catch (e) { reject(e); }
        })();
    });
}

export async function initialiseTables() {
    const queries = ['main', ...countries].reduce((acc, dbName) => [
        ...acc,
        ...tables
            .map(t => `create table if not exists ${t.name} (${t.cols});`)
            .map(q => dbTransaction(q, null, dbName))
    ], []);
    await Promise.all(queries);
}

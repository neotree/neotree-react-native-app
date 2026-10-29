import { dbTransaction } from './db';
import { SESSIONS_ADDED_COLUMNS, SESSIONS_TABLE_COLUMNS } from './schema';
import { logError } from '@/src/utils/logError';

// Column names are SQL identifiers, which cannot be bound as parameters, so every key
// used below is checked against the sessions schema. Values are always bound. Without
// this, a caller that spread an object built from outside data would be writing SQL.
const SESSION_COLUMNS = new Set<string>([
    ...SESSIONS_TABLE_COLUMNS.map(definition => definition.trim().split(/\s+/)[0]),
    ...SESSIONS_ADDED_COLUMNS.map(([name]) => name),
]);

function assertSessionColumns(keys: string[]) {
    const unknown = keys.filter(key => !SESSION_COLUMNS.has(key));
    // The same outcome sqlite gave for an unknown column ("no such column"), but
    // reported before any of the key reaches the SQL text.
    if (unknown.length) throw new Error(`updateSession: unknown column(s) ${unknown.join(', ')}`);
}

export const updateSession = (data: any = {}, opts: any = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const where = opts.where || {};
            data = { updatedAt: new Date().toISOString(), ...data };
            assertSessionColumns([...Object.keys(where), ...Object.keys(data)]);

            // Build WHERE clause safely
            const whereClauses = Object.keys(where).map(key => `${key}=?`);
            const whereValues = Object.values(where);
            const whereStatement = whereClauses.length > 0 ? whereClauses.join(' AND ') : '1';
            
            // Build SET clause safely
            const setClauses = Object.keys(data).map(key => `${key}=?`);
            const setValues = Object.values(data);
            const setStatement = setClauses.join(',');
            
            const allValues = [...setValues, ...whereValues];
            
            const query = `UPDATE sessions SET ${setStatement} WHERE ${whereStatement};`;
        
            const res = await dbTransaction(query, allValues);
            resolve(res);
        } catch (e) {
            logError('updateSession', e);
            reject(e);
        }
    })();
});

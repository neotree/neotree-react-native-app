import { dbTransaction } from './db';
import { logError } from '@/src/utils/logError';

export const updateSession = (data: any = {}, opts: any = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const where = opts.where || {};
            data = { updatedAt: new Date().toISOString(), ...data };
            
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

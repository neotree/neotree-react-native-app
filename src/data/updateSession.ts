import { dbTransaction } from './db';
export const updateSession = (data: any = {}, opts: any = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const where = opts.where || {};
            data = { updatedAt: new Date().toISOString(), ...data };
            const _where = Object.keys(where).map(key => `${key}=${JSON.stringify(where[key])}`)
                .join(',');
            const set = Object.keys(data)
                .map(key => `${key}=?`)
                .join(',');
            const res = await dbTransaction(`update sessions set ${set} where ${_where || 1};`, Object.values(data));
            resolve(res);
        } catch (e) { 
            
            reject(e); }
    })();
});

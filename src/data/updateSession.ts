import { dbTransaction } from './db';
// export const updateSession = (data: any = {}, opts: any = {}) => new Promise((resolve, reject) => {
//     (async () => {
//         try {
//             console.log("-----DATA BEF====",data)
//             const where = opts.where || {};
//             data = { updatedAt: new Date().toISOString(), ...data };
//             const _where = Object.keys(where).map(key => `${key}=${JSON.stringify(where[key])}`)
//                 .join(',');
//             const set = Object.keys(data)
//                 .map(key => `${key}=?`)
//                 .join(',');
//                 console.log("-----SET====",await dbTransaction(`select id,local_export,exported from sessions;`))
//             const res = await dbTransaction(`update sessions set ${set} where ${_where || 1};`, Object.values(data));
//             resolve(res);
//         } catch (e) { 
            
//             reject(e); }
//     })();
// });

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
            console.error("Update error:", e);
            reject(e);
        }
    })();
});

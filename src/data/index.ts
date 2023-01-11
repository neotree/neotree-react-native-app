import { makeApiCall } from './api';
import { dbTransaction } from './db';

export * from './api';

export * from './db';

export * from './queries';

export * from './initialiseData';

export * from './convertSessionsToExportable';

export * from './exportSessions';

export * from './saveSession';

export * from './updateSession';

export const exportSession = async (s: any) => {
    return await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
        method: 'POST',
        body: JSON.stringify(s),
    });
};

export const logout = () => new Promise((resolve, reject) => {
    (async () => {
        try {
            await dbTransaction(
                'insert or replace into authenticated_user (id, details) values (?, ?);',
                [1, null],
            );
            resolve(null);
        } catch (e) { reject(e); }
    })();
});

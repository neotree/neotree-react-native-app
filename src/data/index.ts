import { makeApiCall } from './api';
import { dbTransaction } from './db';

export * from './api';

export * from './db';

export * from './queries';

export * from './syncData';

export * from './convertSessionsToExportable';

export * from './exportSessions';

export * from './saveSession';

export * from './updateSession';

export * from './auth';

export const exportSession = async (s: any) => {
    return await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
        method: 'POST',
        body: JSON.stringify(s),
    });
};

export const getExportedSessionsByUID = (uid: string) => new Promise<any []>((resolve, reject) => {
    (async () => {
        if (!uid) return reject(new Error('UID is required'));

        try {
            const res = await makeApiCall('nodeapi', `/find-sessions-by-uid?uid=${uid}`);
            const json = await res.json();
            return resolve(json?.sessions || []);
        } catch (e) { /**/ }

        try {
            const sessions = await dbTransaction('select * from exports where uid=? order by ingested_at desc;', [uid]);
            resolve(sessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
        } catch (e) { console.log(e); reject(e); }
    })();
});

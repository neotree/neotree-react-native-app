import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { makeApiCall } from './api';
import { updateSession } from './updateSession';

export const exportSessions = (sessions?: any[]) => new Promise((resolve, reject) => {
    (async () => {
        try {
            if (!sessions) sessions = await dbTransaction('select * from sessions where exported != ?;', [true]);

            const promises: Promise<any>[] = [];
            const allSessions = sessions.filter(s => s.data.completed_at || s.data.canceled_at).map(s => ({ ...s, data: JSON.parse(s.data || '{}'), }));
            const completedSessions: any = allSessions.filter(s => s.data.completed_at);

            if (completedSessions.length) {
                const postData: any = await convertSessionsToExportable(completedSessions);
                postData.forEach((s: any, i: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                method: 'POST',
                                body: JSON.stringify(s),
                            });
                            const id = completedSessions[i].id;
                            await updateSession({ exported: true }, { where: { id, }, });
                        } catch (e) { console.log(e); return reject(e); }
                        resolve(null);
                    })();
                })));
            }

            if (completedSessions.length) {
                const pollData: any = await convertSessionsToExportable(completedSessions, { showConfidential: true, });
                pollData.forEach((s: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                method: 'POST',
                                body: JSON.stringify(s),
                            });
                        } catch (e) { return reject(e); }
                        resolve(null);
                    })();
                })));
            }

            await Promise.all(promises);

            resolve(null);
        } catch (e) { reject(e); }
    })();
});

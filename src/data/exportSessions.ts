import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { makeApiCall } from './api';
import { updateSession } from './updateSession';

export const exportSessions = (sessions?: any[]) => new Promise((resolve, reject) => {
    (async () => {
        try {
			let dbSessions = [];
            if (!sessions) dbSessions = await dbTransaction('select * from sessions where exported != ?;', [true]);

            const promises: Promise<any>[] = [];
            const exportableDbSessions = dbSessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}'), })).filter(s => s.data.completed_at || s.data.canceled_at);
            const exportData: any[] = sessions || exportableDbSessions.filter(s => s.data.completed_at);

            if (exportData.length) {
                const postData: any = await convertSessionsToExportable(exportData);
                postData.forEach((s: any, i: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                method: 'POST',
                                body: JSON.stringify(s),
                            });
                            const id = exportData[i].id;
                            await updateSession({ exported: true }, { where: { id, }, });
							resolve(true);
                        } catch (e) { console.log(e); reject(e); }
                    })();
                })));
            }

            if (exportData.length) {
                const pollData: any = await convertSessionsToExportable(exportData, { showConfidential: true, });
                pollData.forEach((s: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                method: 'POST',
                                body: JSON.stringify(s),
                            });
							resolve(true);
                        } catch (e) { reject(e); }
                    })();
                })));
            }

            await Promise.all(promises);

            resolve(null);
        } catch (e) { reject(e); }
    })();
});

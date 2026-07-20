import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { makeApiCall, makeLocalApiCall, hasLocalServerConfig } from './api';
import { updateSession } from './updateSession';
import { withExportLock } from './exportLock';

const doExportSessions = (sessions?: any[]) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const hasLocalConfig = await hasLocalServerConfig();

			let dbSessions = [];

            // only local-server sites track local_export; querying it at other
            // sites would rescan every exported session forever
            if (!sessions) dbSessions = await dbTransaction(
                hasLocalConfig
                    ? 'SELECT * FROM sessions WHERE exported IS NOT ? OR local_export IS NOT ?;'
                    : 'SELECT * FROM sessions WHERE exported IS NOT ?;',
                hasLocalConfig ? [true, true] : [true]
            );


            const promises: Promise<any>[] = [];
            const exportableDbSessions = dbSessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}'), })).filter(s => s.data.completed_at || s.data.canceled_at);
            const exportData: any[] = sessions || exportableDbSessions.filter(s => s.data.completed_at && !s.exported);

            const failed: any[] = [];

            if (exportData.length) {
                const postData: any = await convertSessionsToExportable(exportData);
           
                postData.forEach((s: any, i: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            const { id, exported,local_export, ...exportable } = s
  
                            if(!exported){
                              
                            const res = await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                method: 'POST',
                                body: JSON.stringify(exportable),
                            });
                            
                            if (res?.status == 200) {
                                await updateSession({ exported: true }, { where: { id, }, });
                                resolve(true);
                            } else {
                                failed.push(id);
                                throw new Error('Failed to export session, try again!');
                            }
                        }
                        } catch (e) { 
                            failed.push(exportData[i].id);
                            console.log(e); 
                            reject(e); 
                        }
                    })();
                })));
            }
            // Handle /local calls (only if hasLocalConfig)
            if (exportData.length && hasLocalConfig) {
                const localData: any = await convertSessionsToExportable(exportData, { showConfidential: true, });

                localData.forEach((s: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            const { id, exported, local_export, ...exportable } = s
                            if(!local_export){
                                const res = await makeLocalApiCall(`/local?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                    method: 'POST',
                                    body: JSON.stringify(exportable),
                                })
                                if (res?.status == 200) {
                                    await updateSession({ local_export: true }, { where: { id, }, });
                                }
                            }
                            resolve(true);
                        } catch (ex) {
                            reject(ex);
                        }
                    })();
                })));
            }

            // Handle /save-poll-data calls (for all records)
            if (exportData.length) {
                const pollData: any = await convertSessionsToExportable(exportData, { showConfidential: true, });

                pollData.forEach((s: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            const { id, exported, local_export, ...exportable } = s
                            if(!exported){
                                await makeApiCall('nodeapi', `/save-poll-data?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                    method: 'POST',
                                    body: JSON.stringify(exportable),
                                });
                            }
                            resolve(true);
                        } catch (e) {
                            reject(e);
                        }
                    })();
                })));
            }

            await Promise.all(promises);

            if (failed.length) throw new Error('Failed to export session, try again!');

            resolve(null);
        } catch (e) {
            reject(e);
        }
    })();
});

export const exportSessions = (sessions?: any[]) => withExportLock(() => doExportSessions(sessions));

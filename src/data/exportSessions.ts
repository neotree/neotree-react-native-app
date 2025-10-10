import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { makeApiCall, makeLocalApiCall } from './api';
import { updateSession } from './updateSession';
import { APP_CONFIG } from '@/src/constants';
import * as types from '../types';
import { getLocation } from './queries';

export const exportSessions = (sessions?: any[]) => new Promise((resolve, reject) => {
    (async () => {
        try {
			let dbSessions = [];
        
            if (!sessions) dbSessions = await dbTransaction('SELECT * FROM sessions WHERE exported IS NOT ? OR local_export IS NOT ?;',[true, true]);

        
            const promises: Promise<any>[] = [];
            const exportableDbSessions = dbSessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}'), })).filter(s => s.data.completed_at || s.data.canceled_at);
            const exportData: any[] = sessions || exportableDbSessions.filter(s => s.data.completed_at);

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
              const location = await getLocation();
               const country =  location?.country;
               let hasLocalConfig = false
              if(country && country.length>0){
                 const config = (APP_CONFIG[country] as types.COUNTRY_CONFIG)['local'];
                 const hospital = location?.hospital
                 const localConfig = config?.filter(c=>c.hospital===hospital?.trim())
                 if(localConfig && localConfig?.[0]?.hospital?.length>0){
                     hasLocalConfig =true 
                 }
            }

            if (exportData.length) {
                const pollData: any = await convertSessionsToExportable(exportData, { showConfidential: true, });
                pollData.forEach((s: any) => promises.push(new Promise((resolve, reject) => {
                    (async () => {
                        const { id, exported,local_export, ...exportable } = s
                        if(hasLocalConfig){

                                try{
                                    if(!local_export){
                             const res= await makeLocalApiCall(`/local?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                method: 'POST',
                                body: JSON.stringify(exportable),
                            })
                              if (res?.status == 200) {
                                await updateSession({ local_export: true }, { where: { id, }, });
                                
                            }


                           }
                           }catch(ex){
                         
                          }
                            }

                        try {
                            if(!s.exported){
                            await makeApiCall('nodeapi', `/save-poll-data?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                                method: 'POST',
                                body: exportable,
                            });
                          }
                            
							resolve(true);
                        } catch (e) { reject(e); }
                    })();
                })));
            }

            await Promise.all(promises);

            if (failed.length) throw new Error('Failed to export session, try again!');

            resolve(null);
        } catch (e) { 
            console.log(e);
            reject(e); 
        }
    })();
});

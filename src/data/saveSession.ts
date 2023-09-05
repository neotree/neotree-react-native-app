import { dbTransaction } from './db';
import { makeApiCall } from './api';
import { exportSessions } from './exportSessions';

export const saveSession = (data: any = {}) => new Promise<any>((resolve, reject) => {
(async () => {
    const columns = [data.id ? 'id' : '', 'uid', 'script_id', 'data', 'completed', 'exported', 'createdAt', 'updatedAt']
        .filter(c => c)
        .join(',');

    const values = [data.id ? '?' : '', '?', '?', '?', '?', '?', '?', '?']
        .filter(c => c)
        .join(',');

    const params = [
        ...data.id ? [data.id] : [],
        data.uid,
        data.script_id,
        JSON.stringify(data.data || '{}'),
        data.completed || false,
        data.exported || false,
        data.createdAt || new Date().toISOString(),
        data.updatedAt || new Date().toISOString(),
    ];

	let sessionID = null;

    let application = null;
    try {
		await dbTransaction(
            `insert or replace into sessions (${columns}) values (${values});`,
            params,
			(_, rslts) => { sessionID = data.id || rslts.insertId; }
        );

        application = await dbTransaction('select * from application where id=1;');
        application = application[0];

        const scripts_count = application.total_sessions_recorded + 1;
        const _application = {
            ...application,
            total_sessions_recorded: scripts_count,
        };

        await dbTransaction(
            `insert or replace into application (${Object.keys(_application).join(',')}) values (${Object.keys(_application).map(() => '?').join(',')});`,
            Object.values(_application)
        );

        application = await dbTransaction('select * from application where id=1;');
        application = application[0];
        if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');

        if (!data.id) {
            makeApiCall('webeditor', '/update-device-registration', {
                method: 'POST',
                body: JSON.stringify({ deviceId: application.device_id, details: { scripts_count } }),
            }).then(() => {}).catch((e) => {
                 
            });
        }
		exportSessions().then(() => {}).catch(() => {}); // this will export sessions that haven't yet been exported
		
		resolve({ application, sessionID });
    } catch (e) { console.log('saveSession', e); reject(e); /* DO NOTHING */ }
})();
});

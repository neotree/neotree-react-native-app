import { dbTransaction } from './db';
import { makeApiCall } from './api';
import { scheduleExportSessions } from './exportSessions';
import { logError } from '@/src/utils/logError';

export const saveSession = (data: any = {}) => new Promise<any>((resolve, reject) => {
(async () => {
	let sessionID = null;

    let application = null;
    try {
        let payloadData = { ...data?.data };
        if (data.id) {
            const existingRows = await dbTransaction('select data from sessions where id=?;', [data.id]);
            const existingKey = (() => {
                try { return JSON.parse(existingRows?.[0]?.data || '{}')?.unique_key; }
                catch { return undefined; }
            })();
            if (existingKey) payloadData = { ...payloadData, unique_key: existingKey };
        }

        const res = data.id
            ? await dbTransaction(
                `UPDATE sessions SET uid=?, script_id=?, data=?, completed=?, updatedAt=? WHERE id=? RETURNING id;`,
                [
                    data.uid,
                    data.script_id,
                    JSON.stringify(payloadData),
                    data.completed || false,
                    data.updatedAt || new Date().toISOString(),
                    data.id,
                ]
            )
            : await dbTransaction(
                `insert into sessions (uid, script_id, data, completed, exported, createdAt, updatedAt) values (?, ?, ?, ?, ?, ?, ?) RETURNING id;`,
                [
                    data.uid,
                    data.script_id,
                    JSON.stringify(payloadData),
                    data.completed || false,
                    data.exported || false,
                    data.createdAt || new Date().toISOString(),
                    data.updatedAt || new Date().toISOString(),
                ]
            );

        if (!res[0]) throw new Error('Failed to save session');

        sessionID = res[0]?.id;

        application = await dbTransaction('select * from application where id=1;');
        application = application[0];

        const scripts_count = application.total_sessions_recorded + 1;
        const _application = {
            ...application,
            total_sessions_recorded: scripts_count,
        };

		if (!data.id) {
			await dbTransaction(
				`insert or replace into application (${Object.keys(_application).join(',')}) values (${Object.keys(_application).map(() => '?').join(',')});`,
				Object.values(_application)
			);
		}

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

		scheduleExportSessions();

		resolve({ application, sessionID });
    } catch (e) { logError('saveSession', e); reject(e); }
})();
});

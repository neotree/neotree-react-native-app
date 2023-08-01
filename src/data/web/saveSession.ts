import { makeApiCall } from './makeApiCall';
import { exportSessions } from './exportSessions';
import { getApplication, saveApplication } from './queries';

export const saveSession = (data: any = {}) => new Promise<any>((resolve, reject) => {
(async () => {
	let sessionID = null;
    let application = null;
    try {
		application = await getApplication();

        const scripts_count = application.total_sessions_recorded + 1;
        const _application = {
            ...application,
            total_sessions_recorded: scripts_count,
        };

		await saveApplication(_application);
		application = await getApplication();

        if (!data.id) {
            makeApiCall('webeditor', '/update-device-registration', {
                method: 'POST',
                body: JSON.stringify({ deviceId: application.device_id, details: { scripts_count } }),
            }).then(() => {}).catch(() => {});
        }
        exportSessions().then(() => {}).catch(() => {}); // this will export sessions that haven't yet been exported
    } catch (e) { reject(e); }

    resolve({ application, sessionID });
})();
});

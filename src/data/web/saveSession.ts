import { makeApiCall } from './makeApiCall';
import { exportSessions } from './exportSessions';
import { getApplication, saveApplication } from './queries';

export const saveSession = (data: any = {}) => new Promise<any>((resolve, reject) => {
(async () => {
	let sessionID = null;
    let application = null;
    try {
		let deviceId = localStorage.getItem('EXPO_CONSTANTS_INSTALLATION_ID');
		const res = await makeApiCall('nodeapi', `/web-app/${deviceId}/saveSession`, {
			method: 'POST',
			body: JSON.stringify({
				id: data.id || undefined,
				data: JSON.stringify(data.data),
				uid: data.uid,
				script_id: data.script_id,
				completed: data.completed || false,
				exported: data.exported || false,
				createdAt: data.createdAt || new Date().toISOString(),
				updatedAt: data.updatedAt || new Date().toISOString(),
				device_id: deviceId,
			}),
		});
		const json = await res.json();
		if (json.data) {
			sessionID = json.data.id;
		}

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
